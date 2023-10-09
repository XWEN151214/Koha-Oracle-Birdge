let id = document.getElementById('id');
let update = document.getElementById('radio-up');
let insert = document.getElementById('radio-in');
let post = document.getElementsByClassName('submit-btn');
let cat = document.getElementById('category');
let text_area = document.getElementsByClassName('prestats');
let text_area1 = document.getElementsByClassName('poststats');
let insert_data = document.getElementById('insert-data');
let update_data = document.getElementById('update-data');
let update_msg = document.getElementById('update-message');
let update_text = document.getElementById('update-text');
cat.value = 'select';
id.value = '';
update.checked = false;
insert.checked = false;
text_area[0].value = text_area[1].value = '';
text_area1[0].value = text_area1[1].value =  '';


async function  call_insert(form_data)
{
    let has_errors = false;
    try
    {
        const response = await axios.get('http://kohaNodeApp:3000/api/emp/insert/', 
                                         {
                                            params: form_data
                                         }
                                        );
        let {data, not_valid, errors} = response.data;
        if (response.data['data'].length === 1 && !not_valid)
        {
            text_area[0].value +=  `  Employee ${response.data['data'][0].userid} retreived\n\n`;
        }
        else if(response.data['data'].length === 0 && !not_valid)
        {
            has_errors = true;
            text_area[0].value += '  Could not find employeee registered with this ID\n\n';
        }
        else if(not_valid)
        {
            has_errors = true;
        }
    
        // To Display Errors
        if(!has_errors)
        {
            post[0].style.display = "block";
        }
        post[0].addEventListener
        (
            'click',
            () =>
            {
                text_area1[0].scrollIntoView();
                post_data(not_valid, data);
            }
        )
    }
    catch(errors)
    {
        console.log(errors);
    }
}

function is_same(obj1, obj2)
{
    for(let i=0; i<Object.keys(obj1).length; i++)
    {
        if(obj1[Object.keys(obj1)[i]] != obj2[Object.keys(obj1)[i]] && obj2[Object.keys(obj1)[i]])
        {
            return false;
        }
    }
    return true;
}

async function call_update(form_data)
{
    try
        {
            const response = await axios.get(
                                                'http://kohaNodeApp:3000/api/emp/update/', 
                                                {
                                                    timeout: 10000,
                                                    params:{
                                                                'category': form_data['category'],
                                                                'id': form_data['id']
                                                        }
                                                }
                                            );
            let {data, oracle_extd_attrs, koha_data, koha_extd, isnot_valid, errors} = response.data;
            let {is_valid, has_errors} = data_valid(data, errors, isnot_valid, koha_data);
            if(!is_valid)
            {
                return;
            }
            show_data(has_errors, data, koha_data, oracle_extd_attrs, koha_extd);
        }
        catch(error)
        {
            console.log(error);
        }
}

function show_data(has_errors, data, koha_data,oracle_extd_attrs, koha_extd )
{
    if(!has_errors)
    {
        if(!is_same(data[0], koha_data[0]))
        {
            post[1].style.display = "block";
            document.getElementById('long-arrow').style.display = 'block'
        }
        else
        {
            update_msg.style.display = 'flex';
            update_text.innerHTML = '';
            update_text.innerHTML += `<h6 class="fw-bold text-center">Patron Have Same Data. No update required</h6>`;
        }
        const attrs = [
                        'userid', 'firstname', 'surname', 'address', 'address2', 'phone', 'mobile', 'email', 
                        'category_id', 'semester', 'Primary phone', 'Other phone', 'category'
                      ];
        const extd_attrs = [
                                'DESG', 'DEPT', 'PAT_NO', 'JOBSTATUS', 'EMPSTATUS'
                           ];
        //for displaying attrs
        for(let i=0; i<attrs.length; i++)
        {
            if(data[0][attrs[i]])
            {
                text_area[1].value += `  ${attrs[i]}: ${data[0][attrs[i]]}\n`
            }
            if(koha_data[0][attrs[i]])
            {
                text_area1[1].value += `  ${attrs[i]}: ${koha_data[0][attrs[i]]}\n`
            }
        }
        //for displaying extended attrs
        for(let i=0; i<oracle_extd_attrs.length; i++)
        {
            if(extd_attrs.find((attrs) => attrs === oracle_extd_attrs[i].type))
            {
                text_area[1].value += `  ${oracle_extd_attrs[i].type.toLowerCase()}: ${oracle_extd_attrs[i].value}\n`
            }
        }
        for(let i=0; i<koha_extd.length; i++)
        {
            if(extd_attrs.find((attrs) => attrs === koha_extd[i].type))
            {
                text_area1[1].value += `  ${koha_extd[i].type.toLowerCase()}: ${koha_extd[i].value}\n`
            }
        }
        post[1].addEventListener
        (
            'click',
            ()=>
            {
                perform_update(data[0], oracle_extd_attrs, koha_data[0]['patron_id']);
            }
        );
    }
}


async function perform_update(data, extd_attrs, pat_id)
{
    text_area1.value = '';
    try
    {
        const response =  await axios.put(
                                        'http://kohaNodeApp:3000/api/patrons/update/',
                                        {},
                                        {
                                            params:{
                                                        data,
                                                        extd_attrs,
                                                        pat_id
                                                   }
                                        }
                                    );
       const {errors} = response.data;
       if(!errors)
       {
            update_msg.style.display = 'flex';
            update_text.innerHTML = '';
            update_text.innerHTML += `<h6 class="fw-bold text-center">Employee Updated</h6>`;
            text_area.value = '';
       }
       else
       {
         update_msg.style.display = 'flex';
         update_text.innerHTML = '';
         update_text.innerHTML += `<h3 class="fw-bold text-center">Errors</h3>`;
         for(let i=0; i<errors.length; i++)
         {
            update_text.innerHTML += `<p class="py-1 px-2">${errors[i].message}</p>`;
         }
       }
    }
    catch(errors)
    {
        console.log(errors);
    }
}


async function get_stats()
{
    text_area.value = '';
    let form_data = {}
    form_data = form_valid();
    if(!form_data)
    {
        return;
    }
    if(update.checked || insert.checked)
    {
        if(insert.checked)
        {
            call_insert(form_data);
        }
        else if(update.checked)
        {
            call_update(form_data);
        }
    }
    else
    {
        alert('Please select Update or Insert');
    }
}


function form_valid()
{
    let form_data = {};
    if(insert.checked)
    {
        if(cat.value)
        {
            form_data['category'] = cat.value;
        }
        else
        {
            console.log('hello')
            alert('Please select a Category');
            return false;
        }
    }
    if(id .value)
    {
        form_data['id'] = id.value;
    }
    else
    {
        alert('Please select an ID');
        return false;
    }
    return form_data;
}

function data_valid(data, errors, isnot_valid, koha_data)
{
    let has_errors = false;
    if(data.length === 0 && !isnot_valid)
    {
        text_area[1].value += '  Error: Employee is not registered\n';
        return {is_valid:false, has_errors};
    }
    else if(isnot_valid)
    {
        for(let i=0; i<errors.length; i++)
        { 
            for(let j=0; j<errors[i]['errors'].length; j++)
            {
                if(Object.keys(errors[i]['errors'][j]).length !== 0)
                {
                    has_errors = true;
                    for(let k=0; k<errors[i]['errors'].length; k++)
                    {
                        if(Object.keys(errors[i]['errors'][k] === 'GSUITE_ID'))
                        {
                            text_area[1].value += `  Employee ${errors[i]['Employee_id']} does not have NED Cloud Email\n\n`;
                        }
                        else
                        {
                            text_area[1].value += `  Employee ${errors[i]['Employee_id']} does not have ${Object.keys(errors[i]['errors'][k])}\n\n`;
                        }
                    }
                }
            }
        }
        return {is_valid:false, has_errors};
    }
    if(koha_data.length === 0)
    {
        has_errors = true;
        text_area1[1].value += '  Error: Employee is not a member of the library\n';
        return {is_valid:false, has_errors};
    }
    return {is_valid:true, has_errors};
}

function show_hide_box()
{
    if(insert.checked)
    {
        insert_data.style.display = 'block';
        update_data.style.display = 'none';
    }
    else if(update.checked)
    {
        update_data.style.display = 'block';
        insert_data.style.display = 'none';
    }
}

async function post_data(not_valid, data)
{
    console.log('hello');
    text_area1.value = '';
    if(update.checked || insert.checked)
    {
        if(data.length !== 0)
        {
            try
            {
                const response = await axios.post
                (
                  'http://kohaNodeApp:3000/api/emp/insert',
                  {},
                  {
                    params:{
                                not_valid,
                                data,
                                'opt': update.checked ? 'update' : 'insert'                           
                           }
                  }
                );
                let not_inserted = response.data['errors'].length;
                console.log( response.data['errors'])
                if(not_inserted != 0)
                {
                    text_area1[0].value += `  Employee not inserted due to duplication`;
                }
                else 
                {
                    text_area1[0].value += ` employee ${update.checked ? 'updated' : 'inserted'}`;
                }
            }
            catch(error)
            {
                console.log(error);
            }
        }
        else
        {
            text_area1[0].value += " Error: no data to be inserted. Check if the database contains the data requested\n\n";
        }
    }
    else
    {
        alert('Pease select update or insert');
    }
}

function close_validations ()
{
   update_msg.style.display = "none";
}
