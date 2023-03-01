import 'reflect-metadata';
import * as constants from 'constants';

function Component(id: number) {
  console.log('init');
  return (target: Function) => {
    console.log('run');
    target.prototype.id = id;
  };
}

function Logger() {
  console.log('init logger');
  return (target: Function) => {
    console.log('run logger');
  };
}

function Method(target: Object, propertyKey: string, propertyDescriptor: PropertyDescriptor) {
  console.log(propertyKey);
  const oldValue = propertyDescriptor.value;
  propertyDescriptor.value = function (...args: any[]) {
    return args[0] * 10;
  };
}

function Prop(target: Object, propertykey: string) {
  let value: number;
  const getter = () => {
    console.log(' Get ! ');
    return value;
  };
  const setter = (newValue: number) => {
    console.log('Set !');
    value = newValue;
  };

  Object.defineProperty(target, propertykey, {
    get: getter,
    set: setter,
  });
}

function Param(target: Object, propertyKey: string, index: number) {
  console.log('Param', propertyKey, index);
}

function validate<T>(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<T>) {
  const set = descriptor.set!;

  descriptor.set = function (value: T) {
    const type = Reflect.getMetadata('design:type', target, propertyKey);

    if (!(value instanceof type)) {
      const msg = `Invalid type, got ${typeof value} not ${type.name}.`;
      throw new TypeError(msg);
    }

    set.call(this, value);
  };
}

function validate2(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const type = Reflect.getMetadata('design:type', target, propertyKey);
  console.log('validate2');
}

class Point {
  constructor(public x: number, public y: number) {}
}

@Logger()
// @Component(1)
export class User {
  @Prop id: number;
  private _start: Point;

  @Method
  updateId(@Param newid: number) {
    this.id = newid;
    return this.id;
  }

  @validate
  // ts inject this
  // __metadata("design:type", Point),
  // __metadata("design:paramtypes", [Point])
  set start(value: Point) {
    this._start = value;
  }

  /*
  __decorate([
    validate2,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Point, Number]),
    __metadata("design:returntype", void 0)
], User.prototype, "func1", null);
   */
  @validate2
  func1(val: Point, b: number, c: string) {
    console.log('func1');
    const v1 = { ...val };
    v1.x += b;
    return 'aalo';
  }
}

console.log(new User().id);
console.log(new User().updateId(2));

console.log('-- LINE');

const line = new User();
line.start = new Point(0, 0);

// line.func1(new Point(10, 0), 5);

// line.start(new Point(0, 0), 'a');
// line.start({ x: 1, y: 1 }, 'b');
