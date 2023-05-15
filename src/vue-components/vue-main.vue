<template>
    <div class="main-container">
        <div class="content">
            <header class="container">
                <h1 class="col-lg-5 col-sm-9 col-12 p-0">
                    <a href="https://wbt.wien/" title="Projektseite Wissensdrehscheibe" target="_blank"><img aria-hidden="true" src="app/img/prepart.svg"/></a><a href="." :title="pageName + ' Home'"><img aria-hidden="true" :src="logoPath"/></a>
                </h1>
                <div class="col-lg-2 col-sm-3 order-lg-last p-0 d-none d-sm-flex" style="justify-content: flex-end; align-items: center;">
                    <a href="https://www.technikum-wien.at/" target="_blank">
                        <img style="min-height: 40px; max-height: 60px; height: 8vw" src="app/img/fhtw.svg"/>
                    </a>
                </div>
                <nav class="col-lg-5 col-sm-12 header-links">
                    <router-link v-for="entry in linkList" class="button" :to="entry.to" :key="entry.to">{{entry.name}}</router-link>
                </nav>
            </header>
            <main>
                <router-view></router-view>
            </main>
        </div>
        <footer>
            <div class="footer-content container">
                <nav class="qa-nav-footer container">
                    <div class="row">
                        <div class="col-md-6 col-lg-8 p-0 mb-4">
                            <span>Diese Seite ist Teil des Projektes</span>
                            <a href="https://wbt.wien/" target="_blank">Wissensdrehschreibe für Barrierefreie Technologien</a>
                            <span>an der</span>
                            <a href="https://www.technikum-wien.at/" target="_blank">FH&nbsp;Technikum&nbsp;Wien</a>.
                        </div>
                        <div class="col-md-6 col-lg-4">
                            <a href="https://www.technikum-wien.at/" target="_blank">
                                <img src="app/img/fhtw.svg"
                                     style="height: 4em; display: inline-block; margin: 0 1em;"/>
                            </a>
                            <a href="https://www.wien.gv.at/kontakte/ma23/" target="_blank">
                                <img src="app/img/ma23.jpg"
                                     style="height: 4em; display: inline-block; margin: 0 1em;"/>
                            </a>
                        </div>
                    </div>
                    <div class="row">
                        <ul role="presentation" class="col-md-6">
                            <li role="tab">
                                <a href="https://wbt.wien/" target="_blank">Projektseite Wissensdrehscheibe</a>
                            </li>
                            <li role="tab">
                                <a href="https://wbt.wien/impressum" target="_blank">Impressum</a>
                            </li>
                            <li role="tab">
                                <a href="https://wbt.wien/kontakt" target="_blank">Kontakt</a>
                            </li>
                            <li role="tab">
                                <a href="https://wbt.wien/datenschutz" target="_blank">Datenschutz</a>
                            </li>
                        </ul>
                    </div>
                </nav>
                <div class="container">
                    <div class="row">
                        <span>Zuletzt aktualisiert: 15.05.2023</span>
                    </div>
                </div>
            </div>
        </footer>
    </div>
</template>

<script>
    export default {
        props: ["pageName", "logoPath", "linkList"],
        data() {
            return {
            }
        },
        methods: {
        },
        mounted() {
        }
    }
</script>

<style scoped>
header img {
    height: 16vw;
    max-height: 70px;
    min-height: 50px;
}

header h1 {
    margin: 0;
}

header h1 a:focus {
    box-shadow: none !important;
}

.content {
    flex: 1 0 auto;
}

header {
    min-height: 70px;
    padding-bottom: 0.5em;
    padding-top: 0.5em;
}

label {
    font-weight: bold;
}

header img {
    max-height: 70px;
    display: inline-block;
}

header.container {
    display: flex;
    flex-wrap: wrap;
    border-bottom: 1px solid #eeeeee;
}

.header-links {
    display: flex;
    align-items: center;
    padding: 0;
    margin: 0.8em 0;
}

.header-links a {
    margin-right: 1.5em;
    color: #000;
    font-weight: bold;
    font-size: 14px;
}

@media (max-width: 576px) {
    .header-links a {
        margin-right: 0.8em;
    }
}

main {
    padding-top: 1.5em;
    padding-bottom: 5em;
}

footer .row {
    margin-bottom: 2em;
}

button {
    cursor: pointer;
}

footer {
    flex-shrink: 0;
    width: 100%;
    background-color: #333333;
    color: #c4c4c4;
    font-size: 16px;
}

.footer-content {
    padding-top: 4em;
    padding-bottom: 2em;
    height: 100%;
}

@media (max-width: 1220px) {
    .footer-content {
        padding-top: 2em;
        padding-bottom: 1em;
    }
}

footer a, footer a:hover {
    color: #c4c4c4;
    font-size: 16px;
    line-height: 1.42857143;
    text-decoration: none;
    font-weight: bold;
}

footer ul {
    list-style-type: none;
    padding: 0;
}

footer li {
    padding: 0 15px 5px 0;
    margin-bottom: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
</style>