import { mount } from '@vue/test-utils';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons/faExclamationCircle';
import Warning from '@/components/Warning';

library.add(faExclamationCircle);

describe('Warning', () => {
  it('make sure component is rendered', () => {
    const textProp = 'This is test';
    const wrapper = mount(Warning, {
      stubs: { FontAwesomeIcon },
      propsData: {
        text: textProp,
        align_left: true,
        animate: false,
      },
    });
    expect(wrapper.props().text).toBe(textProp);
    expect(wrapper.props().align_left).toBe(true);
    expect(wrapper.props().animate).toBe(false);
    expect(wrapper.text()).toContain(textProp);
  });
});
