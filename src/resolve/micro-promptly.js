// I wanted to use promptly, but it uses {...options} syntax, so it wouldn't work in node6
// This implements the API subset I use
import read from 'read';

function validate(choices, resp) {
    if (choices.indexOf(resp) > -1) {
        return resp
    }
}

function choose(text, choices, options) {
    return read({
            prompt: text
        }).then((resp) => {
            const cleanResult = validate(choices, (options.trim ? resp.trim() : resp))
            if (!cleanResult && options.retry) {
                return choose(text, choices, options)
            }
            return cleanResult
        })
}

export default {
    choose
};