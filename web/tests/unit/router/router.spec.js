import { createLocalVue, mount } from '@vue/test-utils';
import VueRouter from 'vue-router';
import router from '@/router';
import App from '@/App';
import Home from '@/views/Home';

const localVue = createLocalVue();
localVue.use(VueRouter);

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(jest.fn());
  jest.spyOn(console, 'debug').mockImplementation(jest.fn());
});

describe('Router testing', () => {
  it('render home page', async () => {
    const wrapper = mount(App, {
      localVue,
      router,
    });
    await router.push('/');
    expect(wrapper.findComponent(Home).exists()).toBe(true);
  });
});
