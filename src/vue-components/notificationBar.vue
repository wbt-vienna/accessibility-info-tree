<template>
    <div id="notificationBar" v-cloak v-show="tooltipHTML">
        <img id="notificationBarImg" v-show="tooltipImageUrl" :src="tooltipImageUrl" alt="" class="inline">
        <div v-html="tooltipHTML" class="inline"></div>
        <div v-if="actionLink" class="inline">
            <a href="javascript:;" @click="onActionLink" style="color: #44a8f1">{{actionLink}}</a>
        </div>
        <button :disabled="!tooltipOptions.closeable" @click="tooltipHTML = ''" style="position: absolute; top: 0; right: 10px; padding: 0 10px">X</button>
    </div>
</template>

<script>
    import $ from 'jquery';
    import {util} from "../js/util/util";

    let notificationBar = null;
    let _defaultTooltipsOptions = {
        closeOnNavigate: true,
        timeout: 0,
        revertOnClose: false,
        actionLink: '',
        actionLinkFn: null,
        imageUrl: null,
        closeable: true
    };

    export default {
        data() {
            return {
                tooltipHTML: null,
                actionLink: null,
                tooltipImageUrl: null,
                lastTooltipOptions: null,
                lastTooltipHTML: null,
                tooltipTimeoutHandler: null,
                tooltipOptions: _defaultTooltipsOptions
            }
        },
        methods: {
            setTooltip: function (html, options) {
                let thiz = this;
                if (!thiz.tooltipOptions.revertOnClose) {
                    thiz.lastTooltipHTML = this.tooltipHTML;
                    thiz.lastTooltipOptions = thiz.tooltipOptions;
                }
                thiz.tooltipOptions = Object.assign(JSON.parse(JSON.stringify(_defaultTooltipsOptions)), options);
                clearTimeout(thiz.tooltipTimeoutHandler);
                if (thiz.tooltipOptions.timeout > 0) {
                    thiz.tooltipTimeoutHandler = setTimeout(() => {
                        thiz.clearTooltip();
                    }, thiz.tooltipOptions.timeout);
                }
                this.tooltipHTML = html;
                this.tooltipImageUrl = thiz.tooltipOptions.imageUrl;
                this.actionLink = thiz.tooltipOptions.actionLink;
            },
            clearTooltip: function () {
                let thiz = this;
                if (thiz.tooltipOptions.revertOnClose && this.tooltipHTML) {
                    thiz.setTooltip(thiz.lastTooltipHTML, thiz.lastTooltipOptions);
                } else {
                    this.tooltipHTML = null;
                    this.actionLink = null;
                    this.tooltipImageUrl = null;
                }
                thiz.lastTooltipOptions = {};
                thiz.lastTooltipHTML = null;
            },
            onActionLink() {
                if (this.tooltipOptions.actionLinkFn) {
                    this.tooltipOptions.actionLinkFn();
                    this.clearTooltip();
                }
            },
        },
        mounted() {
            initNotificationBar();
            notificationBar = this;
        },
        beforeDestroy() {
        }
    }

    function initNotificationBar() {
        /*let element = document.getElementById("notificationBar");
        let imgElement = document.getElementById("notificationBarImg");
        $("#notificationBar").draggable({
            containment: "#app",
            start: function (event, ui) {
                element.style.bottom = "initial";
                element.style.right = "initial";
            },
        });
        $("#notificationBar").resizable({
            containment: "#app",
            start: function (event, ui) {
                imgElement.style.height = '90%';
                element.style.bottom = "";
                element.style.right = "";
            }
        });

        window.addEventListener('resize', () => {
            util.debounce(function () {
                resetSavedNotificationBarStyles();
            }, 300, 'RESIZE_RESET_NOTIFICATIONBAR');
        });

        function resetSavedNotificationBarStyles() {
            let displayStyle = element.style.display;
            element.setAttribute('style', "");
            imgElement.setAttribute('style', "");
            element.style.display = displayStyle;
        }*/
    }
</script>

<style scoped>
    #notificationBar {
        position: fixed;
        bottom: 1vh;
        right: 1vw;
        z-index: 100;
        background: black;
        opacity: 0.85;
        border-radius: 10px;
        color: whitesmoke;
        width: 50vw;
        padding: 10px 40px 10px 10px;
    }

    #notificationBarImg {
        vertical-align: middle;
        max-height: 100%;
        max-width: 80%;
        height: 4vh;
        width: auto
    }
</style>