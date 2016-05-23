class Timeline {

    constructor() {
        this.container = document.querySelector('.timeline__container');
        this.timelineIndicator = document.querySelector('.timeline__indicator');
        this.markers = document.querySelectorAll('.timeline__marker:not(.timeline__marker--ignore)');
        this.minimap = document.querySelector('.timeline__minimap');
        this.minimapIndicator = document.querySelector('.timeline__minimap__indicator');
        this.minimapMarkerContainer = document.querySelector('.timeline__minimap__markers');

        // Binds `this` of the methods to the class instance
        // instead of the event target. i.e. Makes `this` refer to the class instance.
        this.onScroll = this.onScroll.bind(this);
        this.handleMarkerClick = this.handleMarkerClick.bind(this);
        this.handleMinimapClick = this.handleMinimapClick.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.update = this.update.bind(this);

        this.minimapWidth = this.minimap.offsetWidth;
        this.minimapCurrentX = 0;

        this.markerPositions = this.getMarkerPositions();
        this.markersLength = this.markerPositions.length;
        this.onMark = false;
        this.markerWidth = this.markers[0].offsetWidth;

        this.lastMarker = this.markerPositions[this.markersLength-1];

        this.targetX = 0;
        this.currentX = 0;
        this.scrollPercent = 0;
        this.maxX = this.lastMarker;
        this.minX = 0;

        this.bastionSequence = '38384040373937396665';
        this.enteredSequence = '';
        this.sequenceTimer;

        this.createMinimapMarkers();
        this.addEventListeners();

        // Start off the game loop.
        requestAnimationFrame(this.update);
    }

    addEventListeners() {
        document.addEventListener('wheel', this.onScroll);
        document.addEventListener('keydown', this.onKeyDown);
        this.container.addEventListener('click', this.handleMarkerClick);
        this.minimap.addEventListener('click', this.handleMinimapClick);
    }

    getMarkerPositions() {
        let positions = [];
        [].forEach.call(this.markers, (marker) => {
            const width = marker.offsetWidth / 2;
            const left = marker.offsetLeft;
            const position = left + width;
            positions.push(position);
        });

        return positions;
    }

    handleMarkerClick(evt) {
        if (!evt.target.classList.contains('marker__icon')) {
            return;
        }

        const parent = evt.target.closest('.timeline__item');
        if (parent) {
            this.setTarget(parent.offsetLeft + (parent.offsetWidth / 2));
            return;
        }
    }

    handleMinimapClick(evt) {
        const clickedX = evt.pageX;

        const leftX = this.minimap.getBoundingClientRect().left;
        const targetX = clickedX - leftX;

        const percentage = (targetX * 100) / this.minimapWidth;
        const target = (percentage * this.maxX) / 100

        this.setTarget(target);
    }

    onKeyDown(evt) {
        this.bastion(evt);

        if (evt.keyCode === 39) { // right
            this.goToNextMaker();
            evt.preventDefault();
        } else if (evt.keyCode === 37) { // left
            this.goToPreviousMaker();
            evt.preventDefault();
        }
    }

    onScroll(evt) {
        evt.preventDefault();

        if (this.targetX < this.minX) {
            this.targetX = this.minX;
            return;
        }

        if (this.targetX > this.maxX) {
            this.targetX = this.maxX;
            return;
        }

        this.targetX += Math.floor(evt.deltaY + evt.deltaX);
        this.scrollPercent = Math.floor((this.targetX * 100) / this.maxX);
    }

    update() {
        requestAnimationFrame(this.update);

        this.updateTimeline();
        this.updateMinimap();
        this.checkIfAnyMarkersWereHit();
    }

    checkIfAnyMarkersWereHit() {
        for (let i = 0; i < this.markersLength; i++) {
            const currentPosition = this.markerPositions[i];
            const minMargin = currentPosition - (this.markerWidth / 2);
            const maxMargin = currentPosition + (this.markerWidth / 2);

            if (!this.onMark && this.targetX >= minMargin && this.targetX <= maxMargin) {
                this.onMark = currentPosition;
                this.timelineIndicator.classList.remove('timeline__indicator--onMark');
                this.markers[i].classList.add('timeline__marker--hit');
                this.markers[i].classList.add('timeline__marker--wasHit');
            }

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

    createMinimapMarkers() {
        for (let i = 0; i < this.markersLength; i++) {
            const markerPercentage = (this.markerPositions[i] * 100) / this.maxX;
            const targetX = (markerPercentage * this.minimapWidth) / 100;

            this.minimapMarkerContainer.innerHTML += `<div class="timeline__minimap__marker"
                style="transform: translateX(${targetX - 1}px)"></div>`;
        }
    }

    updateMinimap() {
        let targetX = (this.scrollPercent * this.minimapWidth) / 100;

        if (targetX < 0)
            targetX = 0;

        if (targetX > this.minimapWidth)
            targetX = this.minimapWidth;

        this.minimapCurrentX += (targetX - this.minimapCurrentX) / 6;
        this.minimapIndicator.style.transform = `translateX(${this.minimapCurrentX}px)`;
    }

    updateTimeline() {
        this.currentX += (this.targetX - this.currentX) / 6;

        if (this.currentX <= this.minX) {
            this.currentX = this.minX;
            this.container.style.transform = `translateX(${-this.minX}px)`;
        } else if (this.currentX >= this.maxX) {
            this.currentX = this.maxX;
            this.container.style.transform = `translateX(${-this.maxX}px)`;
        } else {
            this.container.style.transform = `translateX(${-this.currentX}px)`;
        }
    }

    goToNextMaker() {
        let nextFound = false;

        for (let i = 0; i < this.markersLength; i++) {
            const markerPosition = this.markerPositions[i];

            if (markerPosition > Math.ceil(this.targetX)) {
                nextFound = markerPosition;
                break;
            }
        }

        if (!nextFound) {
            return;
        }

        this.setTarget(nextFound);
    }

    goToPreviousMaker() {
        let previousFound = false;

        for (let i = 0; i < this.markersLength; i++) {
            const markerPosition = this.markerPositions[i];

            if (markerPosition < Math.ceil(this.targetX)) {
                previousFound = markerPosition;
            }
        }

        if (!previousFound) {
            this.setTarget(0);
            return;
        }

        this.setTarget(previousFound);
    }

    setTarget(target) {
        this.targetX = Math.floor(target);
        this.scrollPercent = Math.floor((target * 100) / this.maxX);
    }

    bastion(evt) {
        this.enteredSequence += evt.keyCode;

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

        if (this.enteredSequence.match(this.bastionSequence)) {
            window.clearTimeout(this.sequenceTimer);
            this.setTarget(this.maxX);
            document.querySelector('.timeline__end').classList.add('show');
            this.enteredSequence = '';
        }
    }
}

window.addEventListener('load', _ => { new Timeline() });
