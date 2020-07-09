/// <reference types="cypress" />

describe('AL&L of Orca Sounds', () => {
    it('Stub statistics', () => {
        cy.server()
        cy.route('/statistics', 'fixture:statistics.json').as('statistics')
        cy.visit('/')
        cy.wait('@statistics').should('have.property', 'status', 200)
    })

    it('Visit querier page and stub filenames', () => {
        cy.server()
        cy.route('/filenames', 'fixture:filenames.json').as('filenames')
        cy.route('/mp3/sound1.mp3', 'fixture:sounds/sound1.mp3')
        cy.get('#play').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/listen')
        cy.wait('@filenames').should('have.property', 'status', 200)
    })

    it('Click on play/pause button', () => {
        cy.get('#play-pause').click()
        cy.get('#pause').should('be.visible')
    })

    it('Testing hover', () => {
        cy.server()
        cy.route('/mp3/sound1.mp3', 'fixture:sounds/sound1.mp3')
        cy.get('.expanded-box-left').invoke('show')
        cy.get('#K').should('be.visible')
        cy.get('#K').click()
        cy.get('.expanded-box-left').invoke('hide')
    })

    it('Testing progress label', () => {
        cy.get('#progress').invoke('width').should('be.gt', 0)
    })

    it('Click 4 more times to invoke level of expertise pop up', () => {
        cy.server()
        cy.route('/mp3/sound1.mp3', 'fixture:sounds/sound1.mp3')
        for (let i = 0; i < 4; i++) {
            cy.get('#orca .text-btn').click()
        }
        cy.get('#labeled-by-container').should('be.visible')
    })

    it('Select level of expertise and stub labeled files', () => {
        cy.server()
        cy.route({
            method: 'POST',
            url: '/labeledfiles',
            response: { success: true },
            status: 201,
        })
        cy.route('/filenames', 'fixture:filenames.json')
        cy.route('/mp3/sound1.mp3', 'fixture:sounds/sound1.mp3')
        cy.get('[type="radio"]').check('Expert', { force: true })
        cy.get('#submit-form').click()
        cy.get('#labeled-by-container').should('not.be.visible')
    })

    it('Go back to the home page', () => {
        cy.server()
        cy.route('/statistics', 'fixture:statistics.json')
        cy.get('#back-btn').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/')
    })
})
