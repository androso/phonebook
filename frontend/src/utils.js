
export const catchErrors = (fn) => {
    return fn().catch(error => {
        console.error(error);
        return true;
    })
}

