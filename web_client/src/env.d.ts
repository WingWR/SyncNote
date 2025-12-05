// 将.vue文件识别为组件
declare module '*.vue' {
    import type { DefineComponent } from "vue";
    const component: DefineComponent<{}, {}, any>
    export default component;
}