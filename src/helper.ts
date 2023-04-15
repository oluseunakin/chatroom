import { EntityState } from "@reduxjs/toolkit";
import { Room } from "./type";

export const transformEntityState = (toTransform: EntityState<Room>) => {
    return toTransform.ids.map((id) => toTransform.entities[id]!)
}