export type ButtonProps = {
  name: string;
  onClick?: any;
  id?: string;
};

export function Button(props: ButtonProps) {
  return (
    <button className="button" onClick={props.onClick} id={props.id}>
      {props.name}
    </button>
  );
}
