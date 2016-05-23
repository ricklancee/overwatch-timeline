// Gameloop techniek gebaseerd op technieken uit de screencast Swipeable Cards: Live
// Code Session - Supercharged https://www.youtube.com/watch?v=rBSY7BOYRo4
// Animation tip: Lerp, https://codepen.io/rachsmith/post/animation-tip-lerp
// https://developer.mozilla.org/en-US/docs/Web/API gebruikt voor api documentatie.

// Wrap alle code in een class om code netjes te organiseren
// onder een namespace en conflicten met andere coden te verkomen.
class Timeline {

    constructor() {
        // Sla nodige elements op in variabelen.
        this.container              = document.querySelector('.timeline__container');
        this.timelineIndicator      = document.querySelector('.timeline__indicator');

        // We willen niet kunnen navigeren naar markers die de class .timeline__marker--ignore hebben.
        // daarom word de selector .timeline__marker:not(.timeline__marker--ignore) gebruikt.
        this.markers                = document.querySelectorAll('.timeline__marker:not(.timeline__marker--ignore)');
        this.minimap                = document.querySelector('.timeline__minimap');
        this.minimapIndicator       = document.querySelector('.timeline__minimap__indicator');
        this.minimapMarkerContainer = document.querySelector('.timeline__minimap__markers');

        // Bind the waarde `this` van de methods aan de class instance i.p.v. de event target.
        // Hiermee kunnen we this gebruiken om te verwijzen naar de instance.
        this.onScroll           = this.onScroll.bind(this);
        this.handleMarkerClick  = this.handleMarkerClick.bind(this);
        this.handleMinimapClick = this.handleMinimapClick.bind(this);
        this.onKeyDown          = this.onKeyDown.bind(this);
        this.update             = this.update.bind(this);

        // Variablen die we nodig hebben voor de minimap.
        this.minimapWidth    = this.minimap.offsetWidth;
        this.minimapCurrentX = 0;

        // Haal de posities van de markers op.
        this.markerPositions = this.getMarkerPositions();
        this.markersLength   = this.markerPositions.length;
        this.onMark          = false;
        this.markerWidth     = this.markers[0].offsetWidth;
        this.lastMarker      = this.markerPositions[this.markersLength-1];

        // Variablen die we nodig hebben.
        this.targetX       = 0;
        this.currentX      = 0;
        this.scrollPercent = 0;

        // we willen niet verder kunnen scrollen dan de laatste marker.
        this.maxX          = this.lastMarker;
        this.minX          = 0;

        // Easter egg.
        this.bastionSequence = '38384040373937396665';
        this.enteredSequence = '';
        this.sequenceTimer;

        this.createMinimapMarkers();
        this.addEventListeners();

        // Begin de game loop.
        requestAnimationFrame(this.update);
    }

    createMinimapMarkers() {
        // Op basis van waar de markers staan in de tijdlijn
        // maak markers aan op de minimap.
        for (let i = 0; i < this.markersLength; i++) {
            // Berken het percentage waar ze staan op de tijdlijn.
            const markerPercentage = (this.markerPositions[i] * 100) / this.maxX;

            // Bereken de target in pixels waar ze moeten komen op de minimap.
            const targetX = (markerPercentage * this.minimapWidth) / 100;

            // Maak de marker aan en zet de hun positie.
            this.minimapMarkerContainer.innerHTML += `<div class="timeline__minimap__marker"
                style="transform: translateX(${targetX - 1}px)"></div>`;
        }
    }

    // Voeg event listeners toe aan dom elementen.
    addEventListeners() {
        document.addEventListener('wheel', this.onScroll);
        document.addEventListener('keydown', this.onKeyDown);
        this.container.addEventListener('click', this.handleMarkerClick);
        this.minimap.addEventListener('click', this.handleMinimapClick);
    }

    // Haal alle posities van de markers op de tijdlijn op.
    getMarkerPositions() {
        let positions = [];
        const length = this.markers.length;

        for (let i = 0; i < length; i++) {
            const marker = this.markers[i];

            // We willen het midden van de marker opslaan als de positie opslaan.
            // niet de meest linker offset. Hierdoor kunnen we centreren.
            const width = marker.offsetWidth / 2;
            const left = marker.offsetLeft;
            const position = left + width;

            positions.push(position);
        }

        return positions;
    }

    // I.p.v. een event listener te plaatsten op alle markers. Word er één
    // op de container geplaatsts en daarin gekeken of er geklit is op
    // een marker.
    handleMarkerClick(evt) {
        // Als de event target niet een een .marker__icon is, zitten
        // we niet op een marker.
        if (!evt.target.classList.contains('marker__icon')) {
            return;
        }

        // Als we op een marker hebben geklikt. Zoek de dichts bijzijnde
        // .timeline__item en bereken zijn positie binnen de timeline om daar heen
        // te navigeren.
        const parent = evt.target.closest('.timeline__item');
        if (parent) {
            this.setTarget(parent.offsetLeft + (parent.offsetWidth / 2));
            return;
        }
    }

    handleMinimapClick(evt) {
        // Sla de geklikte x positie binnen het document op.
        const clickedX = evt.pageX;

        // leftX is de positie waar de minimap staat op de pagina.
        // Deze waarde kan veranderen, daarom word die herbereken per click. !note Dit
        // kan beter om het via een resize event te doen; dit is luiheid :c
        const leftX = this.minimap.getBoundingClientRect().left;

        // Bereken waar we hebben geklikt op de minimap.
        const targetX = clickedX - leftX;

        // Bereken de percentage op de minimap waar we hebben geklikt.
        const percentage = (targetX * 100) / this.minimapWidth;

        // Op basis van het percentage, bereken waar dit in pixels is
        // op de tijdlijn.
        const target = (percentage * this.maxX) / 100

        this.setTarget(target);
    }

    onKeyDown(evt) {
        // Easter egg code.
        this.bastion(evt);

        if (evt.keyCode === 39) { // rechts
            this.goToNextMaker();
            evt.preventDefault();
        } else if (evt.keyCode === 37) { // links
            this.goToPreviousMaker();
            evt.preventDefault();
        }
    }

    onScroll(evt) {
        // Zorgt er voor dat default scrollen wordt geannuleerd -- zoals
        // de 'bounce' op mac.
        evt.preventDefault();

        // We willen niet verder kunnen navigeren dan het het minimum...
        if (this.targetX < this.minX) {
            this.targetX = this.minX;
            return;
        }

        // of het maximum.
        if (this.targetX > this.maxX) {
            this.targetX = this.maxX;
            return;
        }

        // Incrementeerd targetX met de mouse delta (Dit is waar we naar toe willen scrollen).
        this.targetX += Math.floor(evt.deltaY + evt.deltaX);

        // Set en bereken het percentage dat dit is op de timeline.
        this.scrollPercent = Math.floor((this.targetX * 100) / this.maxX);
    }

    update() {
        // Dit looped deze function elke frame (~16ms).
        // Hierdoor kunnen we animeren.
        requestAnimationFrame(this.update);

        this.updateTimeline();
        this.updateMinimap();
        this.checkIfAnyMarkersWereHit();
    }

    updateTimeline() {
        // Gebruik animatie techniek 'lerping' om de animatie
        // te easen.
        this.currentX += (this.targetX - this.currentX) / 6;

        // We willen niet dat we verder dan het begin of het einde kunnen
        // scrollen.
        if (this.currentX <= this.minX) {
            this.currentX = this.minX;
        } else if (this.currentX >= this.maxX) {
            this.currentX = this.maxX;
        }

        this.container.style.transform = `translateX(${-this.currentX}px)`;
    }

    updateMinimap() {
        // Bereken de positie waar de minimap inidicator moet komen te staan.
        let targetX = (this.scrollPercent * this.minimapWidth) / 100;

        // We willen niet buiten de boudaries kunnen gaan.
        if (targetX < 0) {
            targetX = 0;
        }

        if (targetX > this.minimapWidth) {
            targetX = this.minimapWidth;
        }

        // Set de positie van de minimap.
        this.minimapCurrentX += (targetX - this.minimapCurrentX) / 6;
        this.minimapIndicator.style.transform = `translateX(${this.minimapCurrentX}px)`;
    }

    checkIfAnyMarkersWereHit() {
        // We moeten alle markers posities checken om te kijken of
        // eentje 'geraakt is'.
        for (let i = 0; i < this.markersLength; i++) {
            const currentPosition = this.markerPositions[i];

            // We willen dat de marker 'ge-hit' wordt, niet, precies in het midden maar
            // binnen een bepaalde marge.
            //
            // Min marge > [----o----] < max marge
            //       ^ < buiten de marge
            //                ^ < binnen de marge
            const minMargin = currentPosition - (this.markerWidth / 2);
            const maxMargin = currentPosition + (this.markerWidth / 2);

            // Als we niet op een marker zitten EN binnen de marge is marker 'hit'.
            if (!this.onMark && this.targetX >= minMargin && this.targetX <= maxMargin) {
                // geef aan dat we op een marker zitten.
                this.onMark = currentPosition;
                this.markers[i].classList.add('timeline__marker--hit');
                this.markers[i].classList.add('timeline__marker--wasHit');
            }

            // Als we op een marker zaten, en nu buiten de marges hebben we een
            // marker verlaten.
            if (
                this.onMark !== false &&
                this.onMark == currentPosition &&
                (this.targetX < minMargin || this.targetX > maxMargin)
            ) {
                this.timelineIndicator.classList.remove('timeline__indicator--onMark');
                this.markers[i].classList.remove('timeline__marker--hit');
                this.onMark = false;
            }
        }
    }

    goToNextMaker() {
        let nextFound = false;

        // Loop over alle markers om de eerst
        // volgende positie te vinden.
        for (let i = 0; i < this.markersLength; i++) {
            const markerPosition = this.markerPositions[i];

            // Als de markerPosition groter is dan waar we nu zijn,
            // hebben we de volgende marker gevonden.

            // -----o--------o--------o--------o------
            //   targetX ^   ^ eerst volgende marker

            if (markerPosition > Math.ceil(this.targetX)) {
                nextFound = markerPosition;
                break;
            }
        }

        // Als er geen gevonden is zijn we bij het eind.
        if (!nextFound) {
            return;
        }

        this.setTarget(nextFound);
    }

    goToPreviousMaker() {
        let previousFound = false;

        // Loop over alle markers om de volgende positie te
        // vinden.
        for (let i = 0; i < this.markersLength; i++) {
            const markerPosition = this.markerPositions[i];

            // Als de marker kleiner is dan waar we nu zijn
            // hebben we de volgende marker gevonden.
            if (markerPosition < Math.ceil(this.targetX)) {
                previousFound = markerPosition;
            }
        }

        // Als er geen gevonden ga naar het begin.
        if (!previousFound) {
            this.setTarget(0);
            return;
        }

        this.setTarget(previousFound);
    }

    setTarget(target) {
        // Set de target an het scroll percentage.
        this.targetX = Math.floor(target);
        this.scrollPercent = Math.floor((target * 100) / this.maxX);
    }

    bastion(evt) {
        // Sla de evt codes op die zijn ingevoerd.
        this.enteredSequence += evt.keyCode;

        // Maak een timer aan die de ingevoerde sequence cleared.
        // Deze begint alleen als we een van de correcte keys
        // hebben ingevoerd en reset telkens.
        if (
            this.enteredSequence.indexOf('38') > -1 &&
            this.bastionSequence.indexOf((evt.keyCode + '')) > -1
        ) {
            window.clearTimeout(this.sequenceTimer);
            this.sequenceTimer = window.setTimeout(_ => {
                this.enteredSequence = '';
                this.sequenceTimer = null;
            }, 2000);
        }

        // Als we de goede code hebben ingevoerd
        // laat de easter egg zien.
        if (this.enteredSequence.match(this.bastionSequence)) {
            window.clearTimeout(this.sequenceTimer);
            this.setTarget(this.maxX);
            document.querySelector('.timeline__end').classList.add('show');
            this.enteredSequence = '';
        }
    }
}

window.addEventListener('load', _ => { new Timeline() });
