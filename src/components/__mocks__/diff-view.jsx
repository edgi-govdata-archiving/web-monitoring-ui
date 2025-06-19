export default function MockDiffView (props) {
  return (
    <ul>
      {Object.entries(props).map(([key, value]) => (
        <li key={key}>
          <code>{key}={JSON.stringify(value)}</code>
        </li>
      ))}
    </ul>
  );
}
