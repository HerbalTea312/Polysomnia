import { config } from "../config.js";
export default function single_page() {

   let del_btn = document.querySelector("#del");
   let main_img = document.querySelector("#main-pic");
   let infobar = document.querySelector("#infobar");
   let title = document.querySelector('h1');
   let em_container = document.querySelector("#emoji");
   let prediction = document.querySelector("#prediction");
   let tags = document.querySelector(".tags");
   let pic1 = document.querySelector("#pic1");
   let pic2 = document.querySelector("#pic2");
   let pic3 = document.querySelector("#pic3");
   let content = document.querySelector("#all-content");

   let url = "";

   function OnLoad() {
      url = config.host + "/dream_item/" + sessionStorage.getItem('dream');
      fetchHandler();
   }

   // Запрос к серверу
   async function fetchHandler() {
      try {
         const response = await fetch(url);
         let data = await response.json();

         // let data = {
         //    "dream": {
         //       "date": "2023-04-26",
         //       "emotion":
         //          // null,
         //          [
         //             {
         //                "description": "Эмоция, основанная на опасении получить физический или моральный вред.",
         //                "name": "Страх"
         //             },
         //             {
         //                "description": "Эмоция, основанная на опасении получить физический или моральный вред.",
         //                "name": "Счастье"
         //             }
         //          ],
         //       "id": 1,
         //       "image": [
         //          {
         //             "cover": true,
         //             "file_name": "1.png"
         //          },
         //          {
         //             "cover": false,
         //             "file_name": "222.png"
         //          },
         //          {
         //             "cover": false,
         //             "file_name": "333.png"
         //          }
         //       ],
         //       "interpretation": `Увидеть выдру, резвящуюся в прозрачных струях воды, с большой долей уверенности предвещает видящему этот сон счастье и удачу в делах. 
         //       Вы найдете идеальное счастье в ранней женитьбе, если вы еще неженаты; женам же этот сон сулит необычайно возросшую нежность их супругов.`,
         //       "noun":
         //          // null,

         //          [{ "value": "дракон" }, { "value": "кошка" }, { "value": "кошка" }, { "value": "кошка" }, { "value": "кошка" },
         //          { "value": "кошка" }, { "value": "кошка" }, { "value": "кошка" }, { "value": "кошка" }, { "value": "кошка" },
         //          { "value": "кошка" }, { "value": "кошкакошкакошкакошкакошка" }, { "value": "кошка" }],

         //       "title": "CORNCORNCORNCORN CORNCORNCORN"
         //    }
         // }

         data = data.dream;
         showInfo(data);
         sessionStorage.setItem('title', data.title);

      } catch (error) {
         console.log(error);
         content.innerHTML = `<p class="error">Пожалуйста, попробуйте зайти позже</p>`;
      }
   }

   // Показать сон
   function showInfo(dream) {

      title.textContent = dream.title;
      infobar.insertAdjacentHTML('beforeend', `<p>${dream.date}</p>`);

      // Эмоции
      const icon_path = config.path_to_index + "icons/";
      if (dream.emotion !== null && dream.emotion.length) {
         sessionStorage.setItem('emotion', JSON.stringify(dream.emotion.map(x => x.name)));
         for (let emo of dream.emotion) {
            em_container.insertAdjacentHTML('BeforeEnd', `<img src=${icon_path + emo.name + ".svg"} alt="${emo.name} ">`);
         }
      }

      // Главные образы
      if (dream.noun !== null) {
         for (let n of dream.noun) {
            tags.insertAdjacentHTML('beforeend', `<li>${n.value}</li>`);
         }
      }

      // Абзацы
      if (dream.interpretation !== null) {
         let paragraphs = dream.interpretation.split('\n');
         paragraphs.forEach((par) => {
            prediction.insertAdjacentHTML('beforeend', `<p>${par}</p>`);
         });
      }

      // картинки
      if (dream.image.length !== 0 && dream.image !== null) {
         let pic_main = Object.values(dream.image).find(item => item.cover);

         let path = config.path_to_img + sessionStorage.getItem("user") + "/" + sessionStorage.getItem('dream') + "/";
         main_img.src = path + pic_main.file_name;
         pic1.src = path + dream.image[0].file_name;
         pic2.src = path + dream.image[1].file_name;
         pic3.src = path + dream.image[2].file_name;
      } else {
         const pic_container = document.querySelector("#pictures");
         pic_container.innerHTML = `<p class="empty-pics">Изображения будут позже :)</p>`;
      }
      sessionStorage.setItem('title', dream.title);
   }


   // Удаление сна
   del_btn.addEventListener('click', del_foo);

   function del_foo() {
      const del_url = config.host + "/dream_item/" + sessionStorage.getItem("dream");
      if (confirm("Вы точно хотите удалить сон?")) {
         fetch(del_url, {
            method: "DELETE"
         }).then(() => {
            page.redirect("/dairy");
         });
      }
   }

   OnLoad();
}

