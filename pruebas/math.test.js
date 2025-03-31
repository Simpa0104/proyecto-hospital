function suma(a, b) {
    return a + b;
}

test('La función suma correctamente 2 + 3', () => {
    expect(suma(2, 3)).toBe(5);
});