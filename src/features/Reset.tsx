import { useDispatch } from "react-redux"

export function Reset(props : {chatReset: Function, userReset: Function, roomReset: Function}) {
    const dispatch = useDispatch()
    const {chatReset, userReset, roomReset} = props
    dispatch(chatReset())
    dispatch(userReset())
    dispatch(roomReset())
    return null
}