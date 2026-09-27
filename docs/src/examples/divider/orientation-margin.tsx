import Divider from 'upthrust-ui/source/Divider'

export default function OrientationMargin() {
  return <div data-divider-margin>
    <Divider titlePlacement="start" orientationMargin={0} data-margin="0">左侧距离 0</Divider>
    <Divider titlePlacement="start" orientationMargin={48} data-margin="48">左侧距离 48px</Divider>
    <Divider titlePlacement="end" orientationMargin="20%" data-margin="20%">右侧距离 20%</Divider>
  </div>
}
