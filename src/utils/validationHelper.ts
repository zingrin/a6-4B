import z from "zod";

export const booleanCoerce = z.preprocess((val) => {
    if (typeof val === "string") {
        if (val.toLowerCase() === "true") return true;
        if (val.toLowerCase() === "false") return false;
    }
    return val;
}, z.boolean());

export const numberCoerce = z.coerce.number();
