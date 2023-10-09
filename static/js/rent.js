let btn=document.getElementsByClassName("form");
let opt=document.getElementsByClassName("calc");
let left=document.getElementsByClassName("left");
let acc_no = document.getElementsByClassName('acc-no');
let title = document.getElementsByClassName('title');
let edition = document.getElementById('edition');
let cost_span = document.getElementById('cost-span');
let stock_type = document.getElementById('stock-type');
let call_no = document.getElementById('call-no');
let cost = document.getElementById('cost');
let rent = document.getElementsByClassName('rent-i');
let clear = document.getElementsByClassName('submit');
let new_opt = document.getElementById('new') ;
let existing_opt = document.getElementById('ext');
let last_serial = document.getElementById('lst-serial');
let author = document.getElementById('author');
let text = document.getElementById('message');
let procurement_year = document.getElementById('procurement-year');
let serial = document.getElementById('serial');
let serial_issue = document.getElementById('serial-issue');
reset_form(true, false, false);

function reset_form(new_value, extisting_value, serial_value)
{
    text.innerHTML = '';
    acc_no[0].value = acc_no[1].value =  '';
    edition.value = '';
    title[0].value = title[1].value =  '';
    author.value = '';
    call_no.value = '';
    cost_span.value = '';
    stock_type.value = '';
    cost.value = '';
    rent[0].value = '';
    rent[1].value = '';
    procurement_year.value = '';
    new_opt.checked = new_value;
    existing_opt.checked = extisting_value;
    last_serial.checked = serial_value;
    serial.value = '';
    serial_issue.value = '';
}

function get_stock_type(stck)
{
    if(stck === '1')
    {
        return 'Purchased'
    }
    else if(stck === '2')
    {
        return 'Complimentary';
    }
    else if(stck === '3')
    {
        return 'Donation';
    }
    else if(stck === '4')
    {
        return 'Replacement';
    }
    else if(stck === '5')
    {
        return 'C/D+Cost';
    }
    else if(stck === '6')
    {
        return 'Gifted';
    }
    else if(stck === '7')
    {
        return 'Article Obtained from PASTIC';
    }
}

function fill_values(ret_title, edition_statement, call, sql_rent, stck, cost, req_author)
{
    edition.value = edition_statement;
    title[0].value = ret_title;
    call_no.value = call;
    rent[0].value = sql_rent;
    cost_span.value = cost;
    stock_type.value = get_stock_type(stck);
    author.value = req_author;
}

function fill_serial(acc, ret_title, acquisition_date, issue)
{
  acc_no[1].value = acc;
  title[1].value = ret_title;
  procurement_year.value = acquisition_date;
  serial_issue.value = issue;
}

async function get_details()
{
    if(existing_opt.checked)
    {
      if(acc_no[0].value)
      {
          try
          {
              const response = await axios.get(
                                                'http://kohaNodeApp:3000/biblio/item',
                                                {
                                                    params:{
                                                                'acc_no': acc_no[0].value
                                                          }
                                                }
                                              );
              const sql_response = await axios.get(
                                                    'http://kohaNodeApp:3000/biblio/policy',
                                                    {
                                                      params:{
                                                                'barcode': acc_no[0].value
                                                             }
                                                    }
                                                    );
              if(response.data.item)
              {
                if(sql_response.data.rent)
                {
                  const sql_rent = sql_response.data.rent
                  const {callnumber, purchase_price, coded_location_qualifier} = response.data.item;
                  const {title, edition_statement, author} = response.data.biblio;
                  fill_values(title, edition_statement, callnumber, sql_rent, coded_location_qualifier, purchase_price, author);
                }
                else
                {
                  text.innerHTML += sql_response.data.message;
                }
              }
              else
              {
                text.innerHTML += `<p>${response.data.message}</p>`;
              }
          }
          catch(errors)
          {
              console.log(errors);
          }
      }
      else
      {
          alert('Please give an ACC NO');
      }
    }
    else if(new_opt.checked)
    {
      if(cost.value)
      {
        try
        {
          const response = await axios.get(
                                            'http://kohaNodeApp:3000/biblio/rent',
                                            {
                                              params:{
                                                        'price': cost.value
                                                    }
                                            }
                                          );
          if(response.data.rent)
          {
            rent[1].value = response.data.rent;
          }
          else
          {
            text.innerHTML += response.data.message;
          }
        }
        catch(error)
        {
          console.log(error);
        }
      }
    }
    else if(last_serial.checked)
    {
      const {sql_serial, new_serial} = await get_serial();
      try
      {
          const response = await axios.get(
                                            'http://kohaNodeApp:3000/biblio/item',
                                            {
                                                params:{
                                                            'acc_no': `S${sql_serial}`
                                                      }
                                            }
                                          );
          if(response.data.item)
          {
            
            const {acquisition_date, serial_issue_number} = response.data.item;
            const {title} = response.data.biblio;
            fill_serial(`S${sql_serial}`, title, acquisition_date, serial_issue_number);
            clear[2].addEventListener
            (
              'click',
              async () =>
              {
                serial.value = `S${new_serial}`;
              }
            )
          }
          else
          {
            text.innerHTML += `<p>${response.data.message}</p>`;
          }
      }
      catch(errors)
      {
          console.log(errors);
      }
    }
    else
    {
      alert('Enter a valid cost');
    }
}

async function get_serial()
{
  try
  {
      const sql_response = await axios.get(
                                            'http://kohaNodeApp:3000/biblio/serial',
                                            {
                                              params:{
                                                        'barcode': acc_no[1].value
                                                    }
                                            }
                                            );
     
        if(sql_response.data.value)
        {
          let sql_serial = sql_response.data.value
          if(typeof(sql_serial) === 'string')
          {
            if(sql_serial.startsWith('s') || sql_serial.startsWith('S'))
            {
              let next_serial = Number(sql_serial.slice(1, sql_serial.length)) + 1
              return await `S${next_serial}`;
            }
          }
          let new_serial = sql_serial + 1;
          return await {sql_serial, new_serial};
        }
        else
        {
          text.innerHTML += sql_response.data.message;
        }
  }
  catch(errors)
  {
      console.log(errors);
  }
}


clear[0].addEventListener
(
  'click',
  () =>
  {
    get_details();
  }
)

clear[1].addEventListener
(
  'click',
  () =>
  {
    get_details();
  }
)

btn[2].addEventListener
(
  'change',
  async () =>
  {
    get_details();
  }
)

btn[0].addEventListener("click",()=>{
  opt[1].style.display="inline-block";
  opt[0].style.display="none";
  opt[2].style.display="none";
});

btn[1].addEventListener("click",()=>{
  opt[0].style.display="inline-block";
  opt[1].style.display="none";
  opt[2].style.display="none";
});

btn[2].addEventListener("click",()=>{
  opt[2].style.display="inline-block";
  opt[0].style.display="none";
  opt[1].style.display="none";
});

