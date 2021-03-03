import { computed, observable } from 'mobx';
import { MArray } from './marray';

class MyExperiment {
  @observable items = MArray.from([1, 2, 3, 4]);
  @computed get squares() {
    return this.items.map(i => i * i).filter(i => i > 1);
  }
}
describe('realworld tests', () => {
  it('should be possible to create one from a computed', () => {
    let experiment = new MyExperiment();
    let computation = experiment.squares.toArray();
    expect(computation).toEqual([4, 9, 16]);
  });
});
