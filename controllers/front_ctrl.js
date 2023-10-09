const path = require('path');

const insert_patrons = (request, response) =>
{
    file_path = path.resolve(__dirname, '../static/insert_Form.html');
    if(file_path)
    {
        return response.status(200).sendFile(file_path);
    }
    return response.status(404).send('file not found');
}

const update_patrons = (request, response) =>
{
    file_path = path.resolve(__dirname, '../static/update_Form.html');
    if(file_path)
    {
        return response.status(200).sendFile(file_path);
    }
    return response.status(404).send('file not found');
}

const contributions = (request, response) =>
{
    file_path = path.resolve(__dirname, '../static/contributions.html');
    if(file_path)
    {
        return response.status(200).sendFile(file_path);
    }
    return response.status(404).send('file not found');
}

const calculations = (request, response) =>
{
    file_path = path.resolve(__dirname, '../static/calculation.html');
    if(file_path)
    {
        return response.status(200).sendFile(file_path);
    }
    return response.status(404).send('file not found');
}

const employees = (request, response) =>
{
    const file_path = path.resolve(__dirname, '../static/emp_Form.html');
    if(file_path)
    {
        return response.status(200).sendFile(file_path);
    }
    return response.status(404).send('file not found');
}

const bookRent = (request, response) =>
{
    const file_path = path.resolve(__dirname, '../static/book_rent.html');
    if(file_path)
    {
        return response.status(200).sendFile(file_path);
    }
    return response.status(404).send('file not found');
}

module.exports =
{
    insert_patrons,
    update_patrons,
    contributions,
    calculations,
    employees,
    bookRent
};