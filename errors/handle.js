const not_valid = (data) =>
{
    let attrs = ['GSUITE_ID', 'STUDENT_ID', 'ACADEMIC_YEAR_ID', 'DISC_ABBREV', 'BATCH_NAME', 'DEPT_ABBREV', 'ISODD'];
    let isnot_valid = false;
    let errors = [];
    for(itr=0; itr!=data.length; itr++)
    {
        let err_attr = {};
        let std_err = {}
        std_err['Student_id'] = data[itr]['STUDENT_ID'];
        attrs.map
        (
            (attr) =>
            {
                let attr_arr = []
                if(data[itr][attr] === '' || data[itr][attr] === null)
                {
                    err_attr[attr] = 'empty';
                    isnot_valid = true;
                }
                attr_arr.push(err_attr);
                std_err['errors'] = attr_arr;
            }
        );
        errors.push
               (
                 std_err
               )
    }
    return {isnot_valid, errors};
}

const emp_not_valid = (data) =>
{
    let attrs = ['EMAIL', 'PERS_NO', 'DESIGNATION', 'DISC_ABBREV', 'JOBSTATUS', 'DEPT_ABBRV', 'EMPLOYEE_STATUS'];
    let isnot_valid = false;
    let errors = [];
    for(itr=0; itr!=data.length; itr++)
    {
        let err_attr = {};
        let std_err = {}
        std_err['Student_id'] = data[itr]['STUDENT_ID'];
        attrs.map
        (
            (attr) =>
            {
                let attr_arr = []
                if(data[itr][attr] === '' || data[itr][attr] === null)
                {
                    err_attr[attr] = 'empty';
                    isnot_valid = true;
                }
                attr_arr.push(err_attr);
                std_err['errors'] = attr_arr;
            }
        );
        errors.push
               (
                 std_err
               )
    }
    return {isnot_valid, errors};
}

module.exports = 
{
    not_valid,
    emp_not_valid
};