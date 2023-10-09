let acc_no = document.getElementById('acce-no');
let ed = document.getElementById('edition');
let title = document.getElementById('title');
let author = document.getElementById('author');
let cost_span = document.getElementById('cost-span');
let stock_type = document.getElementById('stock-type');
let procurement_year = document.getElementById('procurement-year');
let market_price = document.getElementById('mth-2');
let market_text = document.getElementById('market-price');
let recovery_price = document.getElementById('price');
let submit_acc = document.getElementById('submit-acc');
let submit_form = document.getElementById('submit-form');
let text = document.getElementById('message');
let out_print = document.getElementById('mth-1');
let input = document.getElementsByClassName("mm");
let radio = document.getElementsByClassName("market");
let has_get = false;
reset_form();


function reset_form()
{
    acc_no.value = '';
    ed.value = '';
    title.value = '';
    author.value = '';
    cost_span.value = '';
    stock_type.value = '';
    procurement_year.value = '';
    market_price.checked = false;
    out_print.checked = false;
    recovery_price.value = '';
    market_text.value = '';
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

function fill_values(replacement_price_date, purchase_price, ret_title, ret_author, edition_statement, stck)
{
    ed.value = edition_statement;
    title.value = ret_title;
    author.value = ret_author;
    cost_span.value = purchase_price;
    procurement_year.value = replacement_price_date;
    stock_type.value = get_stock_type(stck);
}


async function get_details()
{
    if(acc_no.value)
    {
        try
        {
            const response = await axios.get(
                                        'http://kohaNodeApp:3000/biblio/item',
                                         {
                                            params:{
                                                        'acc_no': acc_no.value
                                                   }
                                         }
                                      );
            if(response.data.item)
            {
                has_get = true;
                const {replacement_price_date, purchase_price, coded_location_qualifier} = response.data.item;
                const {title, author, edition_statement} = response.data.biblio;
                fill_values(replacement_price_date, purchase_price, title, author, edition_statement, coded_location_qualifier);
            }
            else
            {
                text.innerHTML = `<p class="text-center">${response.data['message']}</p>`;
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

function get_year(date)
{
    return date.slice(0, 4);
}

async function get_recovery_price()
{
    if(market_price.checked)
    {
        await get_details();
        recovery_price.value = `${Number(market_text.value) * 2}`;
    }
    else
    {
        return alert('Select an option first');
    }
}   

const out_of_print = async () =>
{
    if(has_get)
    {
        try
        {
            const response = await axios.get(
                                                'http://kohaNodeApp:3000/biblio/price',
                                                {
                                                    params:{
                                                                'price': cost_span.value,
                                                                'barcode': acc_no.value,
                                                                'p_year': get_year(procurement_year.value)
                                                        }
                                                }
                                            );
            if(response.data['value'])
            {
                recovery_price.value =  response.data['value'];
            }
            else
            {
                recovery_price.value = `${response.data['message']}`;
            }
        }
        catch(error)
        {
            console.log(error);
        }
    }
}

out_print.addEventListener
(
    'change',
    async () =>
    {
        await get_details();
        await out_of_print();
    }
);

submit_form.addEventListener
(
    'click',
    async () =>
    {
        await get_recovery_price();
    }
);


radio[0].addEventListener("change", () => {

    if (input[0].style.display === "none") {
        input[0].style.display = "block";
        submit_form.style.display = "block";
    }
    else
    {
        input[0].style.display = "none";
        submit_form.style.display = "none";
    }
}
)

