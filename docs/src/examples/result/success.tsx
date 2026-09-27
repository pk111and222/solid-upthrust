import Button from 'upthrust-ui/source/Button'
import Result from 'upthrust-ui/source/Result'

export default function Success() {
  return <Result
    status="success"
    title="Successfully Purchased Cloud Server ECS!"
    subTitle="Order number: 2017182818828182881 Cloud server configuration takes 1-5 minutes, please wait."
    extra={[<Button type="primary">Go Console</Button>, <Button>Buy Again</Button>]}
  />
}
