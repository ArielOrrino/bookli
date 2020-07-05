const fixture = require('../../scripts/fixture.js');
const startServer = require('../../server/src/index.js');
const BookModels = require('../../server/src/models/book.js');

let BASE_URL;
let server;

before(async (browser, done) => {
    server = await startServer();

    BASE_URL = `http://localhost:${server.address().port}`;
    done();
});

beforeEach(async (browser, done) => {
    await BookModels.Book.sync({ force: true });
    await fixture.initBooks();
    done();
});

after(() => {
    server.close();
});

describe('Home Test', () => {
    test('Deberia tener de titulo Bookli', browser => {
        browser
            .url(BASE_URL)
            .waitForElementVisible('body')
            .assert.titleContains('Bookli');
    });

    test('Deberia mostrar el logo de Bookli', browser => {
        browser
            .url(BASE_URL)
            .waitForElementVisible('body')
            .waitForElementVisible('.brand__logo')
            .assert.attributeContains(
                '.brand__logo',
                'src',
                '/assets/logo.svg'
            );
    });

    test('Deberia mostrar que el input de busqueda tiene Placeholder', browser => {
        browser
        .url(BASE_URL)
        .waitForElementVisible('body')
        .waitForElementVisible('.search__input')
        .assert.attributeContains(
            '.search__input',
            'placeholder',
            'Buscar un libro')
    });

    test('Deberia mostrar la lista de libros', browser => {
        browser
            .url(BASE_URL)
            .waitForElementVisible('body')
            .waitForElementVisible('.booklist .book')
            .assert.elementPresent('.booklist .book');
    });

    test('Deberia poder encontrar un libro por titulo', browser => {
        browser
            .url(BASE_URL)
            .waitForElementVisible('body')
            .waitForElementVisible('.booklist .book')
            .click('.search__input')
            .keys('Operaci')
            .pause(400)
            .expect.elements('.booklist .book')
            .count.to.equal(1);
    });


    test('Deberia mostrar un mensaje cuando no se encuentra un libro', browser => {
        browser
            .url(BASE_URL)
            .waitForElementVisible('body')
            .waitForElementVisible('.booklist .book')
            .click('.search__input')
            .keys('No existe')
            .pause(400);

        browser.expect.elements('.booklist .book').count.to.equal(0);
        browser.expect
            .element('.booklist.booklist--empty p')
            .text.to.equal(
                'Hmmm... Parece que no tenemos el libro que buscas.\nProba con otra busqueda.'
            );
    });

    test('Opacidad de la card al hacer Hover', browser => {
        browser
            .url(BASE_URL)
            .waitForElementVisible('body')
            .waitForElementVisible('.booklist')
            .pause(400)
            .moveToElement('body > main > div > div.books-container > div > a:nth-child(1)', 10, 10, function() {
            browser.assert.cssProperty('body > main > div > div.books-container > div > a:nth-child(1)', 'opacity', '0.4')
            })
    });

    test('Deberia volver a home al presionar Atras en un libro', browser => {
        browser
            .url(BASE_URL)
            .waitForElementVisible('body')
            .waitForElementVisible('.booklist .book')
            .click('.search__input')
            .keys('opera')
            .click('.book')
            .waitForElementVisible('.back')
            .pause(1000)
            .click('.back')
            .waitForElementVisible('body');
        browser.expect
            .url().equal(BASE_URL+'/');
    });


    test('En la pagina de home deberia mostrar por defecto los libros en estado AVAILABLE', browser => {
        
        browser
        .url(BASE_URL)
        .waitForElementVisible('body')
        .waitForElementVisible('.booklist .book')
     
         browser.expect.elements('.booklist .book').count.to.equal(10);
        
        
        browser
        .url(BASE_URL + '/detail/1')
        .waitForElementVisible('body')
        .waitForElementVisible('.book__actions [data-ref=addToList]');

        browser
        .click('.book__actions [data-ref=addToList]')
        .waitForElementVisible('.book__actions [data-ref=removeFromList]');
         
        browser
            .url(BASE_URL)
            .waitForElementVisible('body')
            .waitForElementVisible('.booklist .book')
         
        browser.expect.elements('.booklist .book').count.to.equal(9);
     
    });

    test('Deberia mostrar el footer en el home', browser => {
        browser
            .url(BASE_URL)
            .waitForElementVisible('footer')
    });

    test('Deberia mostrar los bordes de las cards', browser => {
        browser
            .url(BASE_URL)
            .waitForElementVisible('body')
            .waitForElementVisible('.booklist')
            .pause(400)
            .moveToElement('body > main > div > div.books-container > div > a:nth-child(1) > div', 10, 10, function() {
            browser.assert.cssProperty('body > main > div > div.books-container > div > a:nth-child(1) > div', 'border', '3px solid grey')
            })

    });

});

describe('Detail view', () => {
    test('Deberia mostrar boton para agregar a lista de lectura', browser => {
        browser
            .url(BASE_URL + '/detail/1')
            .waitForElementVisible('body')
            .waitForElementVisible('.book__actions [data-ref=addToList]');

        browser.expect
            .element('.book__actions [data-ref=addToList]')
            .text.to.equal('Empezar a leer');
    });

    test('Deberia mostrar boton para remover libro de la lista de lectura si el libro es parte de la lista de lectura', browser => {
        browser
            .url(BASE_URL + '/detail/1')
            .waitForElementVisible('body')
            .waitForElementVisible('.book__actions [data-ref=addToList]');

        browser
            .click('.book__actions [data-ref=addToList]')
            .pause(1000)
            .waitForElementVisible('.book__actions [data-ref=removeFromList]');

        browser.expect
            .element('.book__actions [data-ref=removeFromList]')
            .text.to.equal('Dejar de leer');
    });

    test('Deberia volver a la pantalla principal cuando presiono el logo', browser => {
        browser
            .url(BASE_URL)
            .waitForElementVisible('body')
            .waitForElementVisible('.booklist .book')
            .click('.search__input')
            .keys('opera')
            .click('.book')
            .waitForElementVisible('.brand')
            .pause(1000)
            .click('.brand')
            .waitForElementVisible('body');
        browser.expect
            .url().equal(BASE_URL+'/');
    });

    test('Deberia poder remover libro de la lista de lectura', browser => {
        browser
            .url(BASE_URL + '/detail/1')
            .waitForElementVisible('body')
            .waitForElementVisible('.book__actions [data-ref=addToList]');

        browser
            .click('.book__actions [data-ref=addToList]')
            .pause(400)
            .waitForElementVisible('.book__actions [data-ref=removeFromList]');

        browser.expect
            .element('.book__actions [data-ref=removeFromList]')
            .text.to.equal('Dejar de leer');

        browser
            .click('.book__actions [data-ref=removeFromList]')
            .pause(400)
            .waitForElementVisible('.book__actions [data-ref=addToList]');

        browser.expect
            .element('.book__actions [data-ref=addToList]')
            .text.to.equal('Empezar a leer');
    });

    test('Deberia poder finalizar un libro de la lista de lectura', browser => {
        browser
            .url(BASE_URL + '/detail/1')
            .waitForElementVisible('body')
            .waitForElementVisible('.book__actions [data-ref=addToList]');

        browser
            .click('.book__actions [data-ref=addToList]')
            .pause(400)
            .waitForElementVisible('.book__actions [data-ref=removeFromList]');

        browser.expect
            .element('.book__actions [data-ref=addToFinish]')
            .text.to.equal('Lo termine!');

        browser
            .click('.book__actions [data-ref=addToFinish]')
            .pause(400)
            .waitForElementVisible('.book__actions [data-ref=removeFromFinish]');

        browser.expect
            .element('.book__actions [data-ref=removeFromFinish]')
            .text.to.equal('Volver a leer');
    });

    test('Deberian aparecer el boton "Dejar de leer" luego de apretar el boton "Volver a leer" ', browser => {
        browser
            .url(BASE_URL + '/detail/1')
            .waitForElementVisible('body')
            .waitForElementVisible('.book__actions [data-ref=addToList]')
            .click('.book__actions [data-ref=addToList]')
            .pause(400)
            .waitForElementVisible('.book__actions [data-ref=addToFinish]')
            .click('.book__actions [data-ref=addToFinish]')
            .pause(400)
            .waitForElementVisible('.book__actions [data-ref=removeFromFinish]')
            .click('.book__actions [data-ref=removeFromFinish]')
            .pause(400)
            .waitForElementVisible('.book__actions [data-ref=removeFromList]');


        browser.expect
            .element('.book__actions [data-ref=removeFromList]')
            .text.to.equal('Dejar de leer');


    });

    test('Deberian aparecer el boton "Lo termine!" luego de apretar el boton "Volver a leer" ', browser => {
        browser
        .url(BASE_URL + '/detail/1')
        .waitForElementVisible('body')
        .waitForElementVisible('.book__actions [data-ref=addToList]')
        .click('.book__actions [data-ref=addToList]')
        .pause(400)
        .waitForElementVisible('.book__actions [data-ref=addToFinish]')
        .click('.book__actions [data-ref=addToFinish]')
        .pause(400)
        .waitForElementVisible('.book__actions [data-ref=removeFromFinish]')
        .click('.book__actions [data-ref=removeFromFinish]')
        .pause(400)
        .waitForElementVisible('.book__actions [data-ref=removeFromList]');

        browser.expect
            .element('.book__actions [data-ref=addToFinish]')
            .text.to.equal('Lo termine!');
    });

    test('test if the country of the book is present in description" ', browser => {
        browser
        .url(BASE_URL + '/detail/1')
        .waitForElementVisible('body')
        .waitForElementVisible('.book__body')
        .waitForElementVisible('.book__extra-info');
        browser.expect
            .element('.book__extra-info').text.to.contains('Argentina');

    });

    test('Deberia mostrar el footer en los detalles del libro', browser => {
        browser
            .url(BASE_URL)
            .waitForElementVisible('footer')
    });

    test('Deberia mostrar el ISBN en los libros', browser => {
        browser
            .url(BASE_URL + '/detail/1')
            .waitForElementVisible('body')
            .waitForElementVisible('.book__body')
            .waitForElementVisible('.book__extra-info')
            browser.expect
            .element('.book__extra-info').text.to.contains('El ISBN del libro es 9788499089515');
    });

    
});

