import { config } from "../config.js";
export default function dairy_page() {

    const url = config.host + "/dream_list/" + sessionStorage.getItem("user");

    // Константы и элементы html
    const form = document.querySelector("form");
    const search = document.querySelector("form input");
    const sortBtn = document.querySelector("#sort");
    const dateStart = document.querySelector("#date-start");
    const dateStop = document.querySelector("#date-stop");
    const reset = document.querySelector("#reset");
    const error = document.querySelector(".error_text");
    const content = document.querySelector('#card-section');

    // Запрос к серверу
    async function fetchHandler() {
        try {
            // Запрос к серверу
            const response = await fetch(url);
            let data = await response.json();
            console.log(data.dreams);

            // let data = {
            //     "dreams": [
            //         {
            //             "date": "2023-04-26",
            //             "emotion": [
            //                 {
            //                     "name": "Страх"
            //                 },
            //                 {
            //                     "name": "Счастье"
            //                 }
            //             ],
            //             "id": 1,
            //             "image": {
            //                 "file_name": "1.png"
            //             },
            //             "title": "POP"
            //         },
            //         {
            //             "date": "2023-04-26",
            //             "emotion": [
            //                 {
            //                     "name": "Ненависть"
            //                 },
            //                 {
            //                     "name": "Счастье"
            //                 }
            //             ],
            //             "id": 90,
            //             "image": {
            //                 "file_name": "11.png"
            //             },
            //             "title": "POP"
            //         },
            //         {
            //             "date": "2023-04-26",
            //             "emotion": null,
            //             "id": 93,
            //             "image": null,
            //             "title": "CORN"
            //         },
            //         {
            //             "date": "2023-04-26",
            //             "emotion": [
            //                 {
            //                     "name": "Страх"
            //                 },
            //                 {
            //                     "name": "Счастье"
            //                 }
            //             ],
            //             "id": 1,
            //             "image": {
            //                 "file_name": "1.png"
            //             },
            //             "title": "POP"
            //         },
            //         {
            //             "date": "2023-04-26",
            //             "emotion": [
            //                 {
            //                     "name": "Страх"
            //                 },
            //                 {
            //                     "name": "Счастье"
            //                 }
            //             ],
            //             "id": 90,
            //             "image": {
            //                 "file_name": "11.png"
            //             },
            //             "title": "POP"
            //         },
            //         {
            //             "date": "2023-04-26",
            //             "emotion": null,
            //             "id": 92,
            //             "image": {
            //                 "file_name": "1.png"
            //             },
            //             "title": "CORNCORNCORNCORN CORNCORNCORN"
            //         }
            //     ]
            // };

            if (data.dreams !== []) {
                showDreams(data.dreams);
                findDreams(data.dreams);
                sortDreams(data.dreams);
            }
        } catch (error) {
            console.log(error);
            content.innerHTML = `<p class="error">Пожалуйста, попробуйте зайти позже</p>`;
        }
    }

    // Поиск
    function findDreams(data) {

        search.addEventListener("blur", onSearch);
        form.addEventListener("submit", onSearch);

        function onSearch(event) {
            event.preventDefault();
            let searchArray = Array.from(data).filter((item) => item.title
                .toLowerCase().indexOf(search.value.toLowerCase()) != -1);
            if (searchArray.length !== 0) {
                showDreams(searchArray);
            } else {
                content.innerHTML = `<p class="error">Мы не нашли снов с таким названием</p>`;
            }
        }
    }

    // Фильтрация
    function sortDreams(data) {
        sortBtn.addEventListener("click", (e) => {
            error.innerHTML = ``;
            e.preventDefault();
            console.log(dateStart, dateStop);
            if (dateStart.value < dateStop.value) {
                let filterArray = Array.from(data).filter((item) => item.date >= dateStart.value && item.date <= dateStop.value);
                showDreams(filterArray);
            }
            else {
                error.textContent = "Не удалось вычислить период"
            }
        })
    }

    // Сброс
    reset.addEventListener('click', (e) => {
        e.preventDefault();
        error.innerHTML = ``;
        fetchHandler();
    })

    // Отобразить список снов
    function showDreams(dataArray) {
        error.innerHTML = ``;
        // Очистить предыдущие
        content.innerHTML = ``;
        // Отобразить список
        dataArray.forEach((dream) => {

            const dreamEl = document.createElement('a');
            dreamEl.classList.add("card");
            dreamEl.classList.add("flex");

            // Картинка сна
            if (dream.image !== null) {
                let path = config.path_to_img + sessionStorage.getItem("user") + "/" + dream.id + "/";
                dreamEl.insertAdjacentHTML('beforeend', `<div class="image-card">
            <img src="${path + dream.image.file_name}" onerror="this.src='./images/not_found.png';"></div>`);
            }
            else {
                dreamEl.insertAdjacentHTML('beforeend', `<div class="image-card">
            <img src="${config.path_to_img}not_found.png"></div>`);
            }
            const description = document.createElement('p');
            description.classList.add("flex");

            // Прочая информация о сне
            description.insertAdjacentHTML('beforeend', `
            <h2>${dream.title}</h2>
            <p>${dream.date}</p>`);

            // эмоции
            let emoji = document.createElement("span");
            const icon_path = config.path_to_index + "icons/";
            if (dream.emotion !== [] && dream.emotion !== null) {
                for (let emo of dream.emotion) {
                    emoji.insertAdjacentHTML('BeforeEnd', `<img src=${icon_path + emo.name + ".svg"}>`);
                }
            }
            else {
                emoji.insertAdjacentHTML('beforeend', `<img src=${icon_path + "Безразличие.svg"} style="opacity:0%;">`)
            }

            description.appendChild(emoji);
            dreamEl.appendChild(description);
            content.appendChild(dreamEl);

            // Переход на страницу сна
            dreamEl.addEventListener('click', () => {
                sessionStorage.setItem('dream', dream.id);
                dreamEl.href = "/dream";
            })
        });
    }

    // Вызов функции
    fetchHandler();
}

