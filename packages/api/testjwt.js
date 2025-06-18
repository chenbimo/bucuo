import { jwtVerifier } from 'bunpi';
const jwtPass = [];

['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach((x) => {
    try {
        const result = jwtVerifier(`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmlja25hbWUiOiJjaGVuc3VpeWkiLCJyb2xlIjoidXNlciIsImlhdCI6MTc1MDIwNTI4OSwiZXhwIjoxNzUyNzk3Mjg5fQ.Dd_PEI1N4nV56OVZHZZ_Wx3YWuVU1ENzlwdQOShyXo${x}`);
        jwtPass.push(x);
    } catch (err) {
        // console.log('🔥[ err ]-7', err);
    }
});
console.log('验证通过的字符', jwtPass.join(''));
