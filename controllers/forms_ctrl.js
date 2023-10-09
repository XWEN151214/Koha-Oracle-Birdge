const mysql = require('mysql2');
const axios = require('axios');
const BASE_ENDPOINT = 'https://eakl.neduet.edu.pk:8001';
const username = '';
const password = ''

let conn = mysql.createConnection(
                                   {
                                        host: '',
                                        user: '',
                                        password: ''
                                   }
                                 );


const get_item = async (request, response) =>
{
    const {acc_no} = request.query;
    let item;
    try
    {
        const items = await axios.get(
                                        `${BASE_ENDPOINT}/api/v1/items/?external_id=${acc_no}`,
                                        {
                                            auth:{
                                                    username,
                                                    password
                                                 }
                                        }
                                       );
        if(items.data.length != 0)
        {
            if(items.data.length > 1)
            {
                item = items.data.filter((item) => item.external_id === acc_no)[0];
                if(!item)
                {
                    return response.status(200).json({'message': 'no item matches the acc no provided'});
                }
            }
            else
            {
                item = items.data[0];
            }
            const biblios = await axios.get(
                                                `${BASE_ENDPOINT}/api/v1/biblios/${item.biblio_id}`,
                                                {
                                                    auth:{
                                                            username,
                                                            password
                                                        }
                                                }
                                            );
            const biblio = biblios.data;
            return response.status(200).json({item, biblio});
        }
        return response.status(200).json({'message': 'no item matches the acc no provided'});
    }
    catch(errors)
    {
        console.log(errors);
    }
}

const get_recovery_price = (request, response) =>
{
    const {price, p_year, barcode} = request.query;
    conn.connect(
                    (err) =>
                    {
                        if (err) throw err
                        conn.query(`USE koha_library`, (err,result) => {});
                        conn.query(
                                    `SELECT calrecoveryprice('${barcode}',
                                                              ${p_year?p_year:null},
                                                              ${price?price:null}) AS value`,
                                    (err, result) =>
                                    {
                                        if(!err)
                                        {
                                            if(result)
                                            {
                                                return response.status(200).json({'value':result[0]['value']});                                    
                                            }
                                        }
                                        return response.status(200).json({'message': 'No value returned'})
                                    }
                                  );
                    }
                )
}

const get_policy = (request, response) =>
{
    const {barcode} = request.query;
    conn.connect(
                    (err) =>
                    {
                        if(err)
                        {
                            return response.status(401).json({'error': 'Connection failed'});
                        }
                        conn.query('USE koha_library', (err, result) => {});
                        conn.query(
                                    `SELECT policyRentBbk('${barcode}') AS rent`,
                                    (err, result) =>
                                    {
                                        if(!err)
                                        {
                                            if(result)
                                            {
                                                return response.status(200).json({'rent':result[0]['rent']}); 
                                            }
                                        }
                                        return response.status(200).json({'message': 'No rent returned'})
                                    }
                                  );
                    }
                )
}

const get_rent = (request, response) =>
{
    const {price} = request.query;
    conn.connect(
                    (err) =>
                    {
                        if(err)
                        {
                            return response.status(401).json({'error': 'Connection failed'});
                        }
                        conn.query('USE koha_library', (err, result) => {});
                        conn.query(
                                    `SELECT calRentBbk(${price}) AS rent`,
                                    (err, result) =>
                                    {
                                        if(!err)
                                        {
                                            if(result)
                                            {
                                                return response.status(200).json({'rent':result[0]['rent']});
                                            }
                                        }
                                        return response.status(200).json({'message': 'No rent returned'})                                        
                                    }
                                );
                    }
                )
}

const get_serial = (request, response) =>
{
    const {barcode} = request.query;
    conn.connect(
                    (err) =>
                    {
                        if(err)
                        {
                            return response.status(401).json({'error': 'Connection failed'});
                        }
                        conn.query('USE koha_library', (err, result) => {});
                        conn.query(
                                    `SELECT lastSerialBarcode() AS value`,
                                    (err, result) =>
                                    {
                                        if(!err)
                                        {
                                            if(result)
                                            {
                                                return response.status(200).json({'value':result[0]['value']});
                                            }
                                        }
                                        return response.status(200).json({'message': 'No value returned'})                                        
                                    }
                                );
                    }
                )
}

module.exports = 
{
    get_item,
    get_recovery_price,
    get_policy,
    get_rent,
    get_serial
};