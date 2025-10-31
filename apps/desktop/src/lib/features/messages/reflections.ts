export const reflections = [
  'Today feels like teal.',
  'Notes are patient places.',
  'When you listen closely, the desk hums back.',
  'Another layer added. No rush to polish.',
  'Saved quietly.',
  'Would the moon understand this note? Probably.',
  'There is time to return.',
  'Patterns repeat until we listen.',
  'Some pages prefer to stay unfinished.',
  'A thought can be both question and answer.'
];

export const randomReflection = () => {
  const index = Math.floor(Math.random() * reflections.length);
  return reflections[index];
};
