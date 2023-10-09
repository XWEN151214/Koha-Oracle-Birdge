let data;
let not_valid;
let btn = document.getElementById('view-stats');
let insert = document.getElementById('insert');
let text_area = document.getElementById('pre-response');
let text_area1 = document.getElementById('post-response');
let cat = document.getElementById('category');
let batch = document.getElementById('btch');
let message = document.getElementById('message');
let message_1 = document.getElementById('message-1');
let valid = document.getElementById('valid');
let valid_1 = document.getElementById('valid-1');
let radio_id = document.getElementById('radio-id');
let user_opt = document.getElementById('opt-1');
let batch_opt = document.getElementById('opt-2'); 
let radio_batch = document.getElementById('radio-batch');
cat.value = '';
batch.value = '';
text_area.value = '';
text_area1.value = '';
radio_id.checked = false;
radio_batch.checked = false;
user_opt.value = '';

async function post_data(not_valid, data)
{
    text_area1.value = '';
    if(data.length !== 0)
    {
        try
        {
            const response = await axios.post
            (
              'http://kohaNodeApp:3000/api/patrons/insert/',
              {},
              {
                params:{
                            not_valid,
                            data
                       }
              }
            );
            let not_inserted = response.data['errors'].length;
            text_area1.value += `  ${data.length-not_inserted > 0?`${data.length-not_inserted} students inserted`
                                   :'No students inserted due to duplication'}\n\n`;
        }
        catch(error)
        {
            console.log(error);
        }
    }
    else
    {
        text_area1.value += " Error: no data to be inserted. Check if the database contains the data requested\n\n";
    }
}

function form_valid()
{
    let form_data = {};
    if(cat.value)
    {
        form_data['category'] = cat.value;
    }
    else
    {
        alert('Please select a Category');
        return false;
    }
    if(radio_batch.checked)
    {
        form_data['batch'] = batch.value;
    }
    else if(radio_id.checked)
    {
        if(user_opt.value)
        {
            form_data['id'] = user_opt.value;
        }
        else
        {
            alert('Please give an ID');
            return false;
        }
    }
    else
    {
        alert('Please give an id or a batch');
        return false;
    }
    return form_data;
}

async function get_stats()
{
    text_area.value = '';
    let form_data = {}
    let has_errors = false;
    form_data = form_valid();
    if(!form_data)
    {
        return;
    }
    try
    {
        const response = await axios.get('http://kohaNodeApp:3000/api/patrons/insert/', 
                                         {
                                            params:form_data
                                         }
                                        );
        let {data, not_valid, errors} = response.data;
        if(response.data['count'] !== 'none' && !not_valid)
        {
            text_area.value += `  ${response.data['data'].length} patrons retrieved\n\n`;
        }
        else if (response.data['count'] === 'none' && response.data['data'].length === 1 && !not_valid)
        {
            text_area.value +=  `  Student ${response.data['data'][0].userid} retreived\n\n`;
        }
        else if(response.data['count'] === 'none' && response.data['data'].length === 0 && !not_valid)
        {
            has_errors = true;
            text_area.value += '  No patron found registered with this ID\n\n';
        }
        else if(response.data['count'] === 'none' && !not_valid)
        {
            let text = document.getElementById('text-1');
            text_area.value += `  ${response.data['data'].length} patrons retrieved\n\n`;
            message_1.style.display = 'flex';
            text.innerHTML = '';
            text.innerHTML += '<h3 class="text-center py-1 px-2">Batch Error</h3>';
            text.innerHTML += `<p class="fw-bold py-1 px-2">No student records exist in Koha for Batch ${batch.value}. Please make sure that the Batch exists in Koha before pressing the INSERT button`;
        }
        // To Display Errors
        for(let i=0; i<response.data['errors'].length; i++)
        { 
            for(let j=0; j<response.data['errors'][i]['errors'].length; j++)
            {
                if(Object.keys(response.data['errors'][i]['errors'][j]).length !== 0)
                {
                    has_errors = true;
                    for(let k=0; k<response.data['errors'][i]['errors'].length; k++)
                    {
                        if(Object.keys(errors[i]['errors'][k] === 'GSUITE_ID'))
                        {
                            text_area.value += `  Student ${errors[i]['Student_id']} does not have NED Cloud Email\n\n`;
                        }
                        else
                        {
                            text_area.value += `  Student ${errors[i]['Student_id']} does not have ${Object.keys(errors[i]['errors'][k])}\n\n`;
                        }
                    }
                }
            }
        }
        if(message_1.style.display === 'flex')
        {
            valid_1.addEventListener
            (
                'click',
                () =>
                {
                    get_disc();
                }
            )
        }
        else
        {
            get_disc();
        }
        if(!has_errors)
        {
            insert.style.display = "block";
        }
        insert.addEventListener
        (
            'click',
            () =>
            {
                text_area1.scrollIntoView();
                post_data(not_valid, data);
            }
        )
    }
    catch(errors)
    {
        console.log(errors);
    }
}

async function get_disc()
{
    let text = document.getElementById('text');
    try
    {
        const response = await axios.get('http://kohaNodeApp:3000/api/patrons/valid/', 
                                         {
                                            timeout: 10000,
                                            params:{
                                                        'category': cat.value,
                                                        'batch': batch.value,
                                                        'id': user_opt.value
                                                   }
                                         }
                                        );
        if(Object.keys(response.data).length != 0)
        {
            if(response.data['disc'])
            {
                message.style.display = 'flex';
                validations_shown = true;
                text.innerHTML = '';
                text.innerHTML += '<h3 class="text-center py-1 px-2">Validations</h3>';
                if(response.data['disc'].length !== 0)
                {
                    text.innerHTML += '<p class="fw-bold py-1 px-2">Make sure that the following Disciplines and related Departments exist in Koha before pressing the INSERT button';
                    for(let i=0; i<response.data['disc'].length; i++)
                    {
                        text.innerHTML += `<p class="px-2">${response.data['disc'][i]['DISCIPLINE']}</p>`;
                    }
                    text.innerHTML += '</p>';
                }
            } 
        }
    }
    catch(errors)
    {
        console.log(errors);
    }
}

function close_validations (id)
{
    let ele = document.getElementById(id);
    ele.style.display = "none";
}

//Toggling radio buttons
radio_id.addEventListener
(
    'change',
    ()=>
    {
        if(user_opt.style.display === 'none')
        {
            user_opt.style.display = 'block';
            batch_opt.style.display = 'none'
        }
        else
        {
            user_opt.style.display = 'none';
            batch_opt.style.display = 'block'
        }
    }
);
radio_batch.addEventListener
(
    'change',
    ()=>
    {
        if(batch_opt.style.display === 'none')
        {
            batch_opt.style.display = 'block'
            user_opt.style.display = 'none';
        }
        else
        {
            batch_opt.style.display = 'none';
            user_opt.style.display = 'block';
        }
    }
)