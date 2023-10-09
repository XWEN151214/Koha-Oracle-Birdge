let btch = document.getElementById('btch');
let category = document.getElementById('category');


category.addEventListener
(
    "change",
    async () =>
    {
        let date = new Date();
        btch.innerHTML = '';
        try
        {
           if(category.value)
           {
                let key;
                const response = await axios.get(`http://kohanodeapp:3000/api/patrons/batches?category=${category.value}`);
                if(category.value === 'Undergrad')
                {
                    key = 'BATCH_NAME';
                }
                else
                {
                    key = 'BATCH';
                }
                btch.value = '';
                btch.value += `${response.data[0].BATCH || response.data[0].BATCH_NAME}`;
           }
        }
        catch(errors)
        {
            console.log(errors);
        }
    }
)

