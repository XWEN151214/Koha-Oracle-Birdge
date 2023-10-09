const axios = require("axios");
const {not_valid, emp_not_valid} = require('../errors/handle');

const get_library_code = (disc_abbrev) =>
{
    if(disc_abbrev === 'AR')
    {
        return 'CC'
    }
    else if(disc_abbrev === 'BM')
    {
        return 'LEJ'
    }
    else if(disc_abbrev === 'TCE' || disc_abbrev === 'TCT')
    {
        return 'TIEST'
    }
    return 'AKL'
}

const get_pglibrary_code = (dept_abbrev) =>
{
    if(dept_abbrev === 'ARD')
    {
        return 'CC'
    }
    else if(dept_abbrev === 'BMD')
    {
        return 'LEJ'
    }
    return 'AKL'
}

const get_type = (acc_year_id, isodd) =>
{
    if(isodd)
    {
        return (acc_year_id * 2) - 1;
    }
    return acc_year_id * 2;
}

const get_pgtype = (semester) =>
{
    if(semester.startsWith('Spring'))
    {
        return semester.slice(0, 11);
    }
    return semester.slice(0, 9);
}

const get_count = async(oracle_count, batch) =>
{
    let koha_count = 0;
    try
    {
        let response = await axios.get('https://seakl.neduet.edu.pk:8001/api/v1/patrons',
                                        {
                                            auth: {
                                                    username: '4530181',
                                                    password: '4530181'
                                                }
                                        }
                                      );
        total = response.headers['x-base-total-count'];   
        response = await axios.get(`https://seakl.neduet.edu.pk:8001/api/v1/patrons?_page=1&_per_page=${total}&altaddress_postal_code=${batch}`,
                                    {
                                        auth: {
                                                username: '4530181',
                                                password: '4530181'
                                            }
                                    }
                                  ); 
        koha_count = response.data.length;
        if(koha_count === 0)
        {
            return 'none';
        }                   
        return await (oracle_count - koha_count);
    }
    catch(error)
    {
        console.log(error);
    } 
}

const format_str = (str) =>
{
    let formed_str = '';
    if(str !== null)
    {
        for(let i=0; i<str.length; i++)
        {
            if(i != 0 && str[i - 1] !== ' ' && str[i - 1] !== ',')
            {
                formed_str += str[i].toLowerCase();
            }
            else
            {
                formed_str += str[i];
            }
        }
    }
    return formed_str;
}

const get_date = () =>
{
    const date = new Date();
    format_date = "";
    format_date +=  `${date.getFullYear()}-`
    if(date.getMonth() > 9)
    {
        format_date += `${date.getMonth()}-`;
    }
    else
    {
        format_date += `0${date.getMonth()}-`;
    }
    if(date.getDate() > 9)
    {
        format_date += `${date.getDate()}`;
    }
    else
    {
        format_date += `0${date.getDate()}`;
    }
    console.log(format_date)
}

const format_data = (rows) =>
{
    let data = [];
    const {isnot_valid, errors} = not_valid(rows);
    if(!isnot_valid)
    {
        rows.map
            (
                (row) =>
                {
                    data.push
                        (
                            {
                                'surname': format_str(row['FATHER_NAME']),
                                'firstname': row['STUDENT_NAME'],
                                'userid': row['STUDENT_ID'],
                                'cardnumber': row['STUDENT_ID'],
                                'library_id': get_library_code(row['DISC_ABBREV']),
                                'date_enrolled': get_date(),
                                'category_id': `UG${row['ACADEMIC_YEAR_ID']}`,
                                'email': row['GSUITE_ID'].toLowerCase(),
                                'expiry_date': get_date(),
                                'phone': row['CONTACT_NO'],
                                'mobile': row['MOBILE_NO'], 
                                'address2': format_str(row['PERMANENT_ADDRESS']),
                                'address': format_str(row['PRESENT_ADDRESS']),
                                'altaddress_postal_code': row['BATCH_NAME'],
                                'city': "",
                                "extended_attributes": 
                                [
                                    {
                                        "type": "AC_YEAR",
                                        "value": `${row['ACADEMIC_YEAR_ID']}`
                                    },
                                    {
                                        "type": "BATCH",
                                        "value": row['BATCH_NAME']
                                    },
                                    {
                                        "type": "DEPT",
                                        "value": row['DEPT_ABBREV']
                                    },
                                    {
                                        "type": "DISC",
                                        "value": row['DISC_ABBREV']
                                    },
                                    {
                                        "type": "PAT_NO",
                                        "value": `${row['ROLL_NO']}/${row['BATCH_NAME']}`
                                    },
                                    {
                                        "type": "TYPE",
                                        "value": `${get_type(row['ACADEMIC_YEAR_ID'], row['IS_ODD'])}`
                                    },
                                ]
                            }
                        );
                }
            );
    }
    return {data, isnot_valid, errors};
}

const format_pgdata = (rows) =>
{
    let data = [];
    const {isnot_valid, errors} = not_valid(rows);
    if(!isnot_valid)
    {
        rows.map
             (
                (row) =>
                {
                    data.push
                         (
                            {
                                'surname': format_str(row['FATHER_NAME']),
                                'firstname': row['STUDENT_NAME'],
                                'userid': row['STUDENT_ID'],
                                'cardnumber': row['STUDENT_ID'],
                                'library_id': get_pglibrary_code(row['DEPT_ABBREV']),
                                'date_enrolled': get_date(row['JOINING_DATE']),
                                'category_id': 'PG',
                                'email': row['EMAIL'].toLowerCase(),
                                'expiry_date': get_date(row['ADHOC_CONTRACT_EXPIRY']),
                                'phone': row['TELEPHONE_NO1'],
                                'mobile': row['TELEPHONE_NO2'], 
                                'address': format_str(row['PERMANENT_ADDRESS']),
                                'altaddress_postal_code': row['BATCH'],
                                'city': "",
                                "extended_attributes": 
                                 [
                                      {
                                          "type": "BATCH",
                                          "value": row['BATCH']
                                      },
                                      {
                                          "type": "DEPT",
                                          "value": row['DEPT_ABBREV']
                                      },
                                      {
                                          "type": "PAT_NO",
                                          "value": `${row['ROLL_NO']}/${row['BATCH']}`
                                      },
                                      {
                                          "type": "TYPE",
                                          "value": `${get_pgtype(row['SEMESTER'])}`
                                      },
                                      {
                                        "type": "PROG_NAME",
                                        "value": `${row['PROGRAMME_NAME']}`
                                      },
                                      {
                                        "type": "PROG_TYPE",
                                        "value": `${row['STD_PROGRAMME']}`
                                      },
                                      {
                                        "type": "FOS",
                                        "value": `${row['FOS']}`
                                      },
                                 ]
                            }
                         );
                }
            );
    }
    return {data, isnot_valid, errors};
}

const format_empdata = (rows) =>
{
    let data = [];
    const {isnot_valid, errors} = emp_not_valid(rows);
    if(!isnot_valid)
    {
        rows.map
            (
                (row) =>
                {
                    data.push
                        (
                            {
                                'surname': format_str(row['FATHER_NAME']),
                                'firstname': row['EMPNAME'].toUpperCase(),
                                'userid': row['PERS_NO'],
                                'cardnumber': row['PERS_NO'],
                                'date_enrolled':row['DATE_ENROLLED'],
                                'category_id': row['CATEGORY'],
                                'library_id': 'AKL',
                                'email': row['EMAIL'],
                                'expiry_date': row['DATE_EXPIRY'],
                                'phone': row['TELNO1'],
                                'mobile': row['TELNO2'], 
                                'address2': format_str(row['PERMANENT_ADDRESS']),
                                'address': format_str(row['PRESENT_ADDRESS']),
                                'city': "",
                                "extended_attributes": 
                                [
                                    {
                                        "type": "DESG",
                                        "value": `${row['DESIGNATION']}`
                                    },
                                    {
                                        "type": "DEPT",
                                        "value": row['DEPT_ABBRV']
                                    },
                                    {
                                        "type": "PAT_NO",
                                        "value": `${row['DEPT_ABBRV']}-${row['PERS_NO']}`
                                    },
                                    {
                                        "type": "JOBSTATUS",
                                        "value": `${row['JOBSTATUS']}`
                                    },
                                    {
                                        "type": "EMPSTATUS",
                                        "value": `${row['EMPLOYEE_STATUS']}`
                                    },
                                ]
                            }
                        );
                }
            );
    }
    return {data, isnot_valid, errors};
}

module.exports = 
{
    get_count,
    format_data,
    format_pgdata,
    format_empdata
};