
const TagExplorer = ({ tags }: { tags: string[] }) => {
  console.log(tags)
  return (
    <ul>
      {tags.map(tag => (<li key={tag}>{tag}</li>))}
    </ul>
  );
};

export default TagExplorer;
