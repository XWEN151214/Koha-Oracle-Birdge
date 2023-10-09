const axios = require("axios");
const {get_data} = require('../oracle/data');
const BASE_ENDPOINT = 'https://seakl.neduet.edu.pk:8001';
const username = '';
const password = ''

const get_stats = async(request, response, next)=>
{
    const {category, id} = request.query;
    const {data, isnot_valid, errors} = await get_data(category, '', id);
    if(data.errorNum)
    {
        return response.status(200).json({'error_number': data.errorNum});
    }
    return response.status(200).json(
                                        { 
                                            'data': data, 
                                            'errors': errors, 
                                            'not_valid': isnot_valid
                                        }
                                   );
}

const get_update = async (request, response) =>
{
    let koha_response, extd_attrs,  oracle_extd_attrs, pat_id;
    const {category, id} = request.query;
    let {data, isnot_valid, errors} = await get_data(category, '', id);
    if(!data || data.length === 0)
    {
        data = []; 
        return response.status(200).json(
            {
                data,
                isnot_valid,
                errors
            }   
        );
    }
    else
    {
        oracle_extd_attrs = data[0]['extended_attributes'];
        delete data[0]['extended_attributes'];
    }
    try
    {
        koha_response = await axios.get(
                                            `${BASE_ENDPOINT}/api/v1/patrons?cardnumber=${id}&firstname=${data[0].firstname}`,
                                            {
                                                auth: {
                                                        username,
                                                        password
                                                    }
                                            }
                                        );
        pat_id = koha_response.data.find((patron)=>patron['cardnumber'] === id).patron_id;
        if(koha_response.data.length != 0)
        {
            try
            {
                extd_attrs = await axios.get(
                                        `${BASE_ENDPOINT}/api/v1/patrons/${pat_id}/extended_attributes`,
                                        {
                                            auth: {
                                                        username,
                                                        password 
                                                    }
                                        }
                                    );
            }
            catch(errors)
            {
                console.log(errors);
            }
        }
        else
        {
            extd_attrs = []
        }
        data[0].category_id = koha_response.data[0].category_id;
        return response.status(200).json(
                                            {
                                                data,
                                                oracle_extd_attrs,
                                                'koha_data': koha_response.data,
                                                'koha_extd': extd_attrs.data,
                                                isnot_valid,
                                                errors
                                            }   
                                        );
    }
    catch(errors)
    {
        console.log(errors);
    }
}


const insert = async (request, response, next) =>
{
    const {not_valid, data, opt} = request.query;
    let errors = [];
    if(not_valid === 'false')
    {
        try
        {
            axios_response = await axios.post
            (
                '${BASE_ENDPOINT}/api/v1/patrons',
                data[0],
                {
                    auth: {
                                username,
                                password
                        },
                    headers: {
                                'Content-Type': 'application/json' 
                            }
                }
            );
        }
        catch(error)
        {
            errors.push
            (
                {
                    "Student_id": data[0]['userid'],
                    "errors": error.response.data
                }
            );
        }
        finally
        {
            return response.status(200).json
                                        (
                                            {
                                                'errors': errors
                                            }
                                        );
        }
        
    }
    response.status(400).json({not_valid});
    next();
}

module.exports = 
{
    get_stats,
    insert,
    get_update
}