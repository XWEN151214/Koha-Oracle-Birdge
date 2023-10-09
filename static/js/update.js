let data;
let not_valid;
let btn = document.getElementById('view-stats');
let update = document.getElementById('update');
let text_area = document.getElementById('pre-response');
let text_area1 = document.getElementById('post-response');
let cat = document.getElementById('category');
let id = document.getElementById('id');
let update_msg = document.getElementById('update-msg');
let update_text = document.getElementById('update-text');
cat.value = 'Select';
id.value = '';
text_area.value = '';
text_area1.value = '';

async function get_stats()
{
    if(cat.value && id.value)
    {
        text_area.value = '';
        try
        {
            const response = await axios.get(
                                                'http://kohaNodeApp:3000/api/patrons/update/', 
                                                {
                                                    timeout: 10000,
                                                    params:{
                                                                'category': cat.value,
                                                                'id': id.value
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
    else
    {
        alert("Please select a category and enter ID");
    }
}

function data_valid(data, errors, isnot_valid, koha_data)
{
    let has_errors = false;
    if(data.length === 0 && !isnot_valid)
    {
        text_area.value += '  Error:No patron found registered with this ID\n';
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
        return {is_valid:false, has_errors};
    }
    if(koha_data.length === 0)
    {
        has_errors = true;
        text_area1.value += '  Error: Student is not a member of the library\n';
        return {is_valid:false, has_errors};
    }
    return {is_valid:true, has_errors};
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
            update_text.innerHTML += `<h6 class="fw-bold text-center">Patron Updated</h6>`;
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

function show_data(has_errors, data, koha_data, oracle_extd_attrs, koha_extd)
{
    if(!has_errors)
    {
        if(!is_same(data[0], koha_data[0]))
        {
            update.style.display = "block";
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
                        'category_id', 'semester', 'Primary phone', 'Other phone', 
                      ];
        const extd_attrs = [
                                'BATCH', 'DEPT', 'DISC', 'PAT_NO', 'AC_YEAR', 'FOS', 'PROG_NAME', 'TYPE'
                           ];
        //for displaying attrs
        for(let i=0; i<attrs.length; i++)
        {
            if(data[0][attrs[i]])
            {
                text_area.value += `  ${attrs[i]}: ${data[0][attrs[i]]}\n`
            }
            if(koha_data[0][attrs[i]])
            {
                text_area1.value += `  ${attrs[i]}: ${koha_data[0][attrs[i]]}\n`
            }
        }
        //for displaying extended attrs
        for(let i=0; i<oracle_extd_attrs.length; i++)
        {
            if(extd_attrs.find((attrs) => attrs === oracle_extd_attrs[i].type))
            {
                text_area.value += `  ${oracle_extd_attrs[i].type.toLowerCase()}: ${oracle_extd_attrs[i].value}\n`
            }
        }
        for(let i=0; i<koha_extd.length; i++)
        {
            if(extd_attrs.find((attrs) => attrs === koha_extd[i].type))
            {
                text_area1.value += `  ${koha_extd[i].type.toLowerCase()}: ${koha_extd[i].value}\n`
            }
        }
        update.addEventListener
        (
            'click',
            ()=>
            {
                perform_update(data[0], oracle_extd_attrs, koha_data[0]['patron_id']);
            }
        );
    }
}

function close_validations ()
{
   update_msg.style.display = "none";
}

