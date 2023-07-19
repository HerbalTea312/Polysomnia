import { config } from "../config.js";
export default function edit_page() {
  const url_send = config.host + "/dream_item/";
  let url_img = config.host + "/image_list/"
  const error = document.querySelector(".warning-text");
  const content = document.querySelector("#content");
  const checkboxes = document.querySelectorAll('input[type=checkbox]');
  const new_title = document.querySelector("#new_title");

  function OnLoad() {
    fetchHandler().then(result => {
      ShowForm(result.data);
      checkConstraint();
    }).catch(error => {
      console.log(error);
    });
  }

  // Получение картинок
  async function fetchHandler() {
    try {
      console.log("dream_id - " + sessionStorage.getItem('dream'));
      const response = await fetch(url_img + sessionStorage.getItem("dream"));
      let data = await response.json();

      // let data = {
      //   "images":
      //     // null,
      //     [
      //       {
      //         "cover": true,
      //         "file_name": "1.png",
      //         "id": 20
      //       },
      //       {
      //         "cover": false,
      //         "file_name": "222.png",
      //         "id": 21
      //       },
      //       {
      //         "cover": false,
      //         "file_name": "1.png",
      //         "id": 22
      //       }
      //     ]
      // }
      return { data: data.images };

    } catch (error) {
      console.log(error);
      content.innerHTML = `<p class="error">Пожалуйста, попробуйте зайти позже</p>`;

    }
  }

  // Выбор картинки
  function ShowForm(pics) {
    const pic_section = document.querySelector('#img-pick');
    const path = config.path_to_img + sessionStorage.getItem("user") + "/" + sessionStorage.getItem("dream") + "/";
    const rb = document.querySelectorAll("input[type=radio]");
    const imgs = document.querySelectorAll("#img-pick label img");

    new_title.placeholder = sessionStorage.getItem('title') !== null ? sessionStorage.getItem('title') : "Название сна";

    // выбранная ранее картинка
    if (pics !== null) {
      let pic_main = pics.filter(item => item.cover)[0];
      if (pics.filter(item => item.file_name).length === 3) {
        for (let i = 0; i < 3; i++) {
          rb[i].value = pics[i].id;
          imgs[i].src = path + pics[i].file_name;
          if (pic_main !== undefined && pics[i].id === pic_main.id) {
            rb[i].checked = true;
          }
        }
      }
    } else {
      pic_section.innerHTML = `<p>Ваши картинки будут позже :)</p>`
    }
    let emo = JSON.parse(sessionStorage.getItem('emotion'));

    if (emo !== null) {
      checkboxes.forEach(item => emo.includes(item.name) ? item.checked = true : null);
    }
  }

  // Ограничение выбора чекбоксов
  function checkConstraint() {
    var maxChecked = 3;
    for (var i = 0; i < checkboxes.length; i++) {
      checkboxes[i].addEventListener('click', function () {
        error.textContent = "";
        var checkedCount = document.querySelectorAll('input[type="checkbox"]:checked').length;
        if (checkedCount > maxChecked) {
          this.checked = false;
          error.textContent = "Выберите не более трех эмоций"
        }
      });
    }
  }

  // Перехватывание формы
  function handleFormSubmit(event) {
    event.preventDefault();
    const data1 = serializeForm(event.target);
    const jsonData = JSON.stringify(Object.fromEntries(data1));
    sendData(jsonData).then(() => {
      page.redirect("/dream");
    });
  }

  // Сериализация данных
  function serializeForm(formNode) {
    const fd = new FormData(formNode);
    let emotions = [];
    for (const [name, value] of fd.entries()) {
      if (name !== 'Title' && value === 'on') {
        emotions.push(name);
      }
    }

    // Проверка данных на пустоту
    let result = new FormData();
    if (fd.get('Title') !== "") {
      result.append('title', fd.get('Title'));
    }
    if (fd.get('cover')) {
      result.append('cover', fd.get('cover'));
    }
    if (emotions.length !== 0) {
      result.append('emotions', emotions);
    }
    console.log(Object.fromEntries(result));
    return result;
  }

  // Отправка на сервер
  async function sendData(data) {
    await fetch(url_send + sessionStorage.getItem("dream"), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: data
    });
    console.log(data);
  }

  // Вызов функции
  OnLoad();
  const applicantForm = document.querySelector('form');
  applicantForm.addEventListener('submit', handleFormSubmit);
}

