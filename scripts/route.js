import record_page from './AudioScript.js';
import dairy_page from './DairyScript.js';
import single_page from './DreamInfo.js';
import edit_page from './EditCardScript.js';
import statistic_page from './DashboardScript.js';

let links = document.querySelectorAll("nav a");

let mainContainer = document.querySelector('main');
mainContainer.innerHTML = ``;

page('/index.html', home);
page('/dairy', dairy);
page('/dream', dream);
page('/edit', edit);
page('/statistics', statistics);

// запись аудио
function home() {
    links[0].classList.add("active");
    links[1].classList.remove("active");
    links[2].classList.remove("active");
    let recordTpl = document.querySelector("#home");
    mainContainer.innerHTML = ``;
    mainContainer.append(recordTpl.content.cloneNode(true));
    record_page();
}

// дневник
function dairy() {
    links[0].classList.remove("active");
    links[1].classList.add("active");
    links[2].classList.remove("active");
    let dairyTpl = document.querySelector('#dairy');
    mainContainer.innerHTML = ``;
    mainContainer.append(dairyTpl.content.cloneNode(true));
    dairy_page();
}

function dream() {
    links[0].classList.remove("active");
    links[2].classList.remove("active");
    let singleTpl = document.querySelector('#single');
    mainContainer.innerHTML = ``;
    mainContainer.append(singleTpl.content.cloneNode(true));
    single_page();
}

function edit() {
    links[0].classList.remove("active");
    links[2].classList.remove("active");
    let EditTpl = document.querySelector('#edit');
    mainContainer.innerHTML = ``;
    mainContainer.append(EditTpl.content.cloneNode(true));
    edit_page();
}

function statistics() {
    links[0].classList.remove("active");
    links[1].classList.remove("active");
    links[2].classList.add("active");
    let statTpl = document.querySelector('#statistics');
    mainContainer.innerHTML = ``;
    mainContainer.append(statTpl.content.cloneNode(true));
    statistic_page();
}

page(); // запуск приложения