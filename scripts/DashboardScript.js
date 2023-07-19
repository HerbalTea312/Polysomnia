import { config } from "../config.js";
export default function statistic_page() {
    let url = config.host + "/dashbord_data/" + sessionStorage.getItem("user");

    // -- DOM --
    let datePicker = document.querySelector("#date");
    let emo_block = document.querySelector("#values");
    let icon_block = document.querySelector("#icons")
    let number_block = document.querySelector("#numbers");
    let calend = document.querySelector("#dream-days");
    let h2_all_dreams = document.querySelector("#dream-count h2");
    let d_mean = document.querySelector("#mean");
    let d_max = document.querySelector("#max");
    let d_min = document.querySelector("#min");
    let pie_DOM = document.querySelector("#pie");
    let fetchDate = "";

    let defDate = new Date();
    defDate = defDate.toISOString().slice(0, 7);

    let date = new Date()
    let month = ("0" + (date.getMonth() + 1)).slice(-2)
    let year = date.getFullYear();
    datePicker.value = `${year}-${month}`;

    datePicker.addEventListener("input", (e) => {
        fetchDate = datePicker.value;
        fetchHandler(fetchDate);
    })

    async function fetchHandler(date = defDate) {
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ "date": date })
            });
            let data = await response.json();

            // let data = {
            //     "dreams": [
            //         {
            //             "date": "2023-04-25",
            //             "duration_audio":
            //                 null,
            //             // 12.0,
            //             "emotion":
            //                 // null,
            //                 [
            //                     {
            //                         "name": "Счастье"
            //                     },
            //                     {
            //                         "name": "Ненависть"
            //                     }
            //                 ],
            //             "id": 1,
            //             "image":
            //             {
            //                 "cover": true,
            //                 "name_neural_network":
            //                     null
            //                 // "DALL-E"
            //             }
            //         },
            //         {
            //             "date": "2023-04-26",
            //             "duration_audio":
            //                 null,
            //             // 13.0,
            //             "emotion":
            //                 null,
            //             // [
            //             //     {
            //             //         "name": "Злость"
            //             //     },
            //             //     {
            //             //         "name": "Ненависть"
            //             //     }
            //             // ],
            //             "id": 2,
            //             "image":
            //             {
            //                 "cover": true,
            //                 "name_neural_network":
            //                     null
            //                 // "Dream"
            //             }
            //         },
            //         {
            //             "date": "2023-04-26",
            //             "duration_audio":
            //                 null,
            //             // 13.0,
            //             "emotion":
            //                 null,
            //             // [
            //             //     {
            //             //         "name": "Злость"
            //             //     },
            //             //     {
            //             //         "name": "Ненависть"
            //             //     }
            //             // ],
            //             "id": 2,
            //             "image":
            //             // null
            //             {
            //                 "cover": true,
            //                 "name_neural_network":
            //                     null
            //                 // "Dream"
            //             }
            //         }
            //     ]
            // }
            let month = +date.slice(5);
            bar_vis(data.dreams);
            calendar_dreams(data.dreams, month);
            pie_neural(data.dreams);
            duration(data.dreams);

        } catch (error) {
            console.log(error);
            const main = document.querySelector("main");
            main.innerHTML = `<p class="error">Пожалуйста, попробуйте зайти позже</p>`;
        }
    }

    function duration(data) {

        // -- ВСЕ СНЫ --
        let all_dreams = data.length;
        h2_all_dreams.textContent = all_dreams;

        // -- ДЛИТЕЛЬНОСТЬ --
        let duration_nest = Array.from(data, function (d) { return d.duration_audio });
        let mean_value = (d3.mean(duration_nest) / 60).toFixed(2);
        let max_value = (d3.extent(duration_nest)[1] / 60).toFixed(2);
        let min_value = (d3.extent(duration_nest)[0] / 60).toFixed(2);

        d_mean.textContent = !isNaN(mean_value) ? mean_value : "0%";
        d_max.textContent = !isNaN(max_value) ? max_value : "0%";
        d_min.textContent = !isNaN(min_value) ? min_value : "0%";
    }

    function bar_vis(data) {

        emo_block.innerHTML = ``;
        icon_block.innerHTML = ``;
        number_block.innerHTML = ``;

        // -- КОЛИЧЕСТВО ЭМОЦИЙ --

        let counters = {
            "Счастье": 0,
            "Грусть": 0,
            "Злость": 0,
            "Удивление": 0,
            "Страх": 0,
            "Отвращение": 0,
            "Ненависть": 0,
            "Безразличие": 0
        };
        let tmp = Array.from(data, function (d) { return d.emotion }).flat();
        for (let item of tmp) {
            if (item) {
                counters[item.name] += 1;
            }
        }

        // -- СОРТИРОВКА -- 
        let emo_arr = Object.entries(counters).sort((a, b) => b[1] - a[1]);
        let emo_keys = emo_arr.map(el => el[0]);
        let emo_data = emo_arr.map(el => el[1]);

        console.log(emo_data)

        // -- ПОДГОТОВКА БАРОВ --
        const color = ['#A250AA', '#9754B7', '#9057BF', '#895AC8',
            '#815DD1', '#7961DB', '#7961DB', '#6A67ED'];
        const colorScale = d3.scaleOrdinal().range(color);

        let h = document.querySelector(".bar-diagram");
        let xAxisLength = h.offsetWidth - 48;
        let xScale = d3.scaleLinear()
            .domain([0, d3.max(emo_data)])
            .range([0, xAxisLength]);

        // ИКОНКИ ЭМОЦИЙ

        d3.select("#icons")
            .selectAll("img")
            .data(emo_keys)
            .enter()
            .append("img")
            .attr("src", function (d) { return config.path_to_index + "icons/" + d + ".svg"; })
            .attr("alt", function (d) { return d; })

        // ЗНАЧЕНИЯ

        d3.select("#numbers")
            .selectAll("span")
            .data(emo_data)
            .enter()
            .append("span")
            .text(function (d) { return d + ""; })

        if (d3.max(emo_data) !== 0) {
            d3.select(".bar-diagram")
                .selectAll(".bar")
                .data(emo_arr)
                .enter().append("div")
                .attr("class", "bar")
                .style("width", function (d) { return xScale(d[1]) + "px"; })
                .style('background-color', (d, i) => colorScale(i));
        }
    }

    function calendar_dreams(data, month) {

        let month_length = 31;
        calend.innerHTML = ``;

        if (month === 2) {
            month_length = 28;
        } else if (month === 4 || month === 6 || month === 9 || month === 11) {
            month_length = 30;
        }
        let date_nest = Array.from(data, function (d) { return Number(d.date.slice(-2)) });

        // -- ЦВЕТА --
        let days = [];
        for (let i = 0; i < month_length; i++) {
            if (date_nest.indexOf(i + 1) != -1) {
                days.push("#656585");
            } else {
                days.push("#0F0F1A");
            }
        }

        // -- КАЛЕНДАРЬ СНОВ --

        let color_calend = d3.scaleOrdinal().range(days);
        d3.select("#dream-days")
            .selectAll(".day")
            .data(days)
            .enter().append("div")
            .attr("class", "day")
            .style("background-color", (d, i) => color_calend(i))
            .style("display", "flex")
            .style("flex-wrap", "wrap")
    }

    function pie_neural(data) {
        pie_DOM.innerHTML = ``;
        let neural_nest = data.filter(d => d.image && d.image.name_neural_network).map(d => d.image.name_neural_network);

        // -- ДОЛИ НЕЙРОННЫХ СЕТЕЙ --
        let neural_arr = [
            { neural: "DALL-E", count: 0 },
            { neural: "Stable Diffusion", count: 0 },
            { neural: "Dream", count: 0 }];

        neural_arr.forEach(NN => {
            let nn_value = (neural_nest.filter(x => x == NN.neural).length / neural_nest.length * 100).toFixed(0);
            NN.count = !isNaN(nn_value) ? nn_value : "0";
        })

        // -- ПИРОГ --
        let margin = 15;

        const colors = d3.scaleOrdinal().range(['#A250AA', '#895AC8', '#6A67ED']);
        let radius = 50;

        var svg = d3.select("#pie")
            .append("svg")
            .attr("width", 200)
            .attr("height", 200)
            .append("g")
            .attr("transform", "translate(" + radius + "," + (radius + margin) + ")");

        var pie_diagram = d3.pie()
            .value(function (d) { return d.count; })(neural_arr);

        svg.selectAll('whatever')
            .data(pie_diagram)
            .enter()
            .append('path')
            .attr('d', d3.arc()
                .innerRadius(0)
                .outerRadius(radius)
            )
            .attr('fill', (d, i) => colors(i));

        // -- ЛЕГЕНДА --
        var legend = d3.select("#legend")
            .selectAll(".legend_row")
            .data(pie_diagram)
            .enter().append("g")
            .attr("class", "legend_row")

        legend.append("div")
            .attr("class", "dot")
            .style("background-color", (d, i) => colors(i));

        let neur_val = legend.append("span")
            .attr("class", "str");

        neur_val.append("span")
            .data(neural_arr)
            .text(function (d) { return d.neural });

        neur_val.append("span")
            .data(neural_arr)
            .text(function (d) { return d.count + "%" });
    }

    fetchHandler();
}
