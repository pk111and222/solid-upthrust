import { For, type Component } from 'solid-js';
import { Router, RouteSectionProps } from "@solidjs/router";
import routes from './router';

const Layout: Component<RouteSectionProps> = (props) => {
  const activeItem = (item) => `/${item.path}` === props.location.pathname 

  return <div data-appid='app' class="h-screen flex items-center justify-center bg-white ">
  <div data-appid='menu' class='w-60 h-full overflow-y-auto shadow border-e border-cyan-100 p-t-10'>
    <For each={routes}>
      {(item, index) => {
        console.log(item, activeItem(item))
        return <a href={item.path} class='m-4 p-l-6 block leading-10 rounded-md bg-blue-50 hover:bg-blue-300 hover:text-white transition-all' classList={{'bg-blue-200': activeItem(item)}}>{item.title}</a>
      }}
    </For>
  </div>
  <div data-appid='content' class='flex-1 h-full overflow-y-auto m-l-8 m-t-8'>
    {props.children}
  </div>
</div>;
}

const App: Component = () => {
  return <Router root={Layout}>{routes}</Router>
};

export default App;
