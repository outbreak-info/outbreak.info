import { calcCI } from '@/js/stats';

describe('Stats js helper', () => {
  it('should return calc result', () => {
    const result = calcCI(2, 10);
    expect(result).toEqual({
      est: 0.2,
      lower: 0.025,
      upper: 0.975,
    });
  });
});
