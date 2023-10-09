const axios = require("axios");
const {get_data, get_batches, get_disc} = require('../oracle/data');
const {get_count} = require('../data/format');
const BASE_ENDPOINT = 'https://seakl.neduet.edu.pk:8001';
const username = '';
const password = ''

const get_stats = async(request, response, next)=>
{
    const {category, batch, id} = request.query;
    const {data, isnot_valid, errors} = await get_data(category, batch, id);
    if(data.errorNum)
    {
        return response.status(200).json({'error_number': data.errorNum});
    }
    if(batch)
    {
        koha_count = await get_count(data.length, batch);
    }
    else
    {
        koha_count = 'none';
    }
    return response.status(200).json(
                                        {
                                            'count':koha_count, 
                                            'data': data, 
                                            'errors': errors, 
                                            'not_valid': isnot_valid
                                        }
                                   );
}

const insert = async (request, response, next) =>
{
    const {not_valid, data} = request.query;
    let errors = [];
    if(not_valid === 'false')
    {
        for(let row=0; row<data.length; row++)
        {
           
            try
            {
                axios_response = await axios.post
                (
                    `${BASE_ENDPOINT}/api/v1/patrons`,
                    data[row],
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
                     "Student_id": data[row]['userid'],
                     "errors": error.response.data
                  }
                );
            }
            finally
            {
                if(row === data.length - 1)
                {
                    return response.status(200).json
                                                (
                                                    {
                                                        'errors': errors
                                                    }
                                                );
                }
            }
        }
    }
    response.status(400).json({not_valid});
    next();
}

const get_update = async (request, response, next) =>
{
    let koha_response, extd_attrs,  oracle_extd_attrs;
    const {category, id} = request.query;
    let {data, isnot_valid, errors} = await get_data(category, '', id);
    if(!data || data.length === 0)
    {
        data = []; 
    }
    else
    {
        oracle_extd_attrs = data[0]['extended_attributes'];
        delete data[0]['extended_attributes'];
    }
    try
    {
        koha_response = await axios.get(
                                            `${BASE_ENDPOINT}/api/v1/patrons?cardnumber=${id}`,
                                            {
                                                auth: {
                                                        username,
                                                        password
                                                    }
                                            }
                                        );
        if(koha_response.data.length != 0)
        {
            try
            {
                extd_attrs = await axios.get(
                                        `${BASE_ENDPOINT}/api//v1/patrons/${koha_response.data[0]['patron_id']}/extended_attributes`,
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

const update = async (request, response, next) =>
{
    const {data, extd_attrs, pat_id} = request.query;
    try
    {
        const koha_response = await axios.put(
                                                `${BASE_ENDPOINT}/api/v1/patrons/${pat_id}`,
                                                data,
                                                {
                                                    auth:{
                                                            username,
                                                            password
                                                        }
                                                }
                                            );
        const extd_response = await axios.put(
                                                    `${BASE_ENDPOINT}/api/v1/patrons/${pat_id}/extended_attributes`,
                                                    extd_attrs,
                                                    {
                                                        auth:{
                                                                username,
                                                                password
                                                             }
                                                    }
                                              );
        return response.status(200).json(
                                            {
                                                'status': 'Patron Updated Successfully'
                                            }
                                        );
    }
    catch(errors)
    {
        console.log(errors.response.data);
        return response.status(200).json(
                                            {
                                                'errors': errors.response.data.errors
                                            }
                                        );
    }
}

const batches = async (request, response, next) =>
{
    const {category} = request.query;
    if(category)
    {
        let batches = await get_batches(category);
        return response.status(200).json(batches);
    }
    return response.status(400).json({'Parameter': 'category not provided'});
}

const valid = async(request, response, next) =>
{
    const {category, batch, id} = request.query;
    let valid_response = {};
    if(batch)
    {
        const disc = await get_disc(category, batch);
        console.log(koha_count);
        if(koha_count === 'none')
        {
            valid_response['batch_error'] = 'batch does not exists';
        }
        if(!id)
        {
            valid_response['disc'] = disc;
        }
        return response.status(200).json(valid_response);
    }
    return response.status(400).json({"error": "batch not provided"});
}

module.exports = 
{
    insert,
    get_stats,
    get_update,
    update,
    batches,
    valid
};