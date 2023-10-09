const oracle = require("oracledb");
const {format_data, format_pgdata, format_empdata} = require('../data/format');

oracle.outFormat = oracle.OUT_FORMAT_OBJECT;
oracle.initOracleClient({libDir:"C:\\instanclient-basic\\instantclient_21_10"});

(async()=>
    {
        try
        {
            conn = await oracle.getConnection
            (
                {
                    user: "",
                    password: "",
                    connectString: ""
                }
            );
        }
        catch(error)
        {
            console.log(error);
            return await error;
        }
    }
)();

const get_batches = async (category) =>
{
    let query;
    if(category === 'Undergrad')
    {
        query = 'select distinct batch_name from v_student_data order by 1 desc';
    }
    else
    {
        query = 'select distinct batch from v_std_card_lib_psms order by 1 desc';
    }
    try
    {
        data = await conn.execute
                           (
                             query
                           );
        return await data['rows'];
    }
    catch(error)
    {
        return await error;
    }
}

const get_disc = async(categroy, batch)=>
{
    try
    {
        if(categroy === 'Undergrad')
        {
            const disc = await conn.execute(
                `
                SELECT DISTINCT DISC_ABBREV, DISCIPLINE FROM V_STUDENT_DATA WHERE BATCH_NAME = '${batch}' MINUS
                SELECT DISTINCT DISC_ABBREV, DISCIPLINE FROM V_STUDENT_DATA WHERE BATCH_NAME = '${Number(batch) - 1}'
                `
            );
            return await disc.rows;
        }
    }
    catch(error)
    {
        console.log(error);
    }
}

const get_query = (category, batch, id) =>
{
    if(id && category === 'Undergrad')
    {
        return `SELECT * FROM v_student_data where student_id='${id}'`
    }
    else if (id  && category === 'Postgrad')
    {
        return  `SELECT DISTINCT FATHER_NAME, STUDENT_NAME, STUDENT_ID, PERMANENT_ADDRESS, TELEPHONE_NO1, TELEPHONE_NO2, GSUITE_ID,
                 DEPT_ABBREV, EMAIL, BATCH, ROLL_NO, PROGRAMME_NAME, SEMESTER, STD_PROGRAMME, FOS
                 FROM V_STD_CARD_LIB_PSMS, portdept WHERE V_STD_CARD_LIB_PSMS.DEPARTMENT_ID = portdept.DEPARTMENT_ID 
                 AND V_STD_CARD_LIB_PSMS.STUDENT_ID = ${id}`;    
    }
    else if(category === 'Undergrad')
    {
       return `SELECT * FROM v_student_data where batch_name='${batch}'`
    }
    else if(category === 'Postgrad')
    {
        return `SELECT DISTINCT FATHER_NAME, STUDENT_NAME, STUDENT_ID, PERMANENT_ADDRESS, TELEPHONE_NO1, TELEPHONE_NO2, GSUITE_ID,
                DEPT_ABBREV, EMAIL, BATCH, ROLL_NO, PROGRAMME_NAME, SEMESTER, STD_PROGRAMME, FOS
                FROM V_STD_CARD_LIB_PSMS, portdept WHERE V_STD_CARD_LIB_PSMS.DEPARTMENT_ID = portdept.DEPARTMENT_ID 
                AND BATCH = '${batch}'`;
    }
    else
    {
        // return 'SELECT * FROM V_LIB_EMPLOYEE'
        return `SELECT DISTINCT FATHER_NAME, EMPNAME, PRESENT_ADDRESS, PERMANENT_ADDRESS, TELNO1, TELNO2,
                EMAIL, PERS_NO, to_char(JOINING_DATE,'RRRR-MM-DD') "DATE_ENROLLED", nvl(to_char(adhoc_contract_expiry,'RRRR-MM-DD'),'2099-12-31') "DATE_EXPIRY", 
                DESIGNATION, DEPT_ABBRV, JOBSTATUS, EMPLOYEE_STATUS FROM V_LIB_EMPLOYEE WHERE PERS_NO IN ${id}`;
    }
}

const get_data = async (category, batch, id) =>
{
    let data;
    let query;
    query = get_query(category, batch, id);
    try
    {
        data = await conn.execute
                           (
                             query
                           );
        if(category === 'Undergrad')
        {
            return await format_data(data['rows']);
        }
        else if(category === 'Postgrad')
        {
            return await format_pgdata(data['rows']);
        }
        if(data['rows'[0]])
        {
            data['rows'][0].category_id = category;
        }
        return await format_empdata(data['rows']);
    }
    catch(error)
    {
        console.log(error)
        return await error;
    }
}

module.exports = 
{
    get_data,
    get_batches,
    get_disc
};