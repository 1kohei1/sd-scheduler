import ObjectID from 'bson-objectid';

export default interface Person {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export const NewPerson = () => {
  return {
    _id: ObjectID.generate(),
    firstName: '',
    lastName: '',
    email: '',
  };
}