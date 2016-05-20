class Timeline {

    constructor() {
        this.container = document.querySelector('.timeline__container');
        this.markers = document.querySelectorAll('.timeline__marker');
        this.minimap = document.querySelector('.timeline__minimap');
        this.minimapIndicator = document.querySelector('.timeline__minimap__indicator');
        this.minimapMakerContainer = document.querySelector('.timeline__minimap__markers');

        this.onScroll = this.onScroll.bind(this);
        this.handleMarkerClick = this.handleMarkerClick.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.update = this.update.bind(this);

        this.targetX = 0;
        this.currentX = 0;
        this.scrollPercent = 0;
        this.maxX = this.container.offsetWidth;
        this.minX = 0;

        this.minimapWidth = this.minimap.offsetWidth;
        this.minimapCurrentX = 0;

        this.markerPositions = this.getMarkerPositions();
        this.markersLength = this.markerPositions.length;

        console.log('Marker positions', this.markerPositions);

        this.createMinimapMarkers();

        this.addEventListeners();
        requestAnimationFrame(this.update);
    }

    addEventListeners() {
        document.addEventListener('mousewheel', this.onScroll);
        this.container.addEventListener('click', this.handleMarkerClick);
        document.addEventListener('keydown', this.onKeyDown);
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
        if (!evt.target.classList.contains('timeline__marker')) {
            return;
        }

        this.setTarget(evt.target.offsetLeft + 7);
    }

    onKeyDown(evt) {
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

        // Todo: Adding evt.deltaX might be buggy
        this.targetX += (evt.deltaY + evt.deltaX) * 0.3;
        this.scrollPercent = Math.floor((this.targetX * 100) / this.maxX);
    }

    update() {
        requestAnimationFrame(this.update);

        this.updateTimeline();
        this.updateMinimap();
        this.checkIfAnyMarkersWereHit();
    }

    checkIfAnyMarkersWereHit() {
        for (var i = 0; i < this.markersLength; i++) {
            if (this.targetX >= this.markerPositions[i]) {
                this.markers[i].classList.add('timeline__marker--hit');
            } else if (this.targetX <= this.markerPositions[i]) {
                this.markers[i].classList.remove('timeline__marker--hit');
            }
        }
    }

    createMinimapMarkers() {
        for (var i = 0; i < this.markersLength; i++) {
            const markerPercentage = (this.markerPositions[i] * 100) / this.maxX;
            const targetX = (markerPercentage * this.minimapWidth) / 100;

            this.minimapMakerContainer.innerHTML += `<div class="timeline__minimap__marker" style="transform: translateX(${targetX - 1}px)"></div>`;
        }
    }

    updateMinimap() {
        const targetX = (this.scrollPercent * this.minimapWidth) / 100;
        this.minimapCurrentX += (targetX - this.minimapCurrentX) / 6;
        this.minimapIndicator.style.transform = `translateX(${this.minimapCurrentX}px)`;
    }

    // Scrolls the timeline to the target targetX;
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
        // figure out next marker.
        let nextFound = false;

        for (let i = 0; i < this.markersLength; i++) {
            const markerPosition = this.markerPositions[i];

            if (markerPosition > Math.ceil(this.targetX)) {
                nextFound = markerPosition;
                break;
            }
        }

        console.log('go to', nextFound);

        if (!nextFound) {
            this.setTarget(this.maxX);
            return;
        }

        // Set the target position
        this.setTarget(nextFound);
    }

    goToPreviousMaker() {
        // figure out next marker.
        let previousFound = false;

        for (let i = 0; i < this.markersLength; i++) {
            const markerPosition = this.markerPositions[i];

            if (markerPosition < Math.ceil(this.targetX)) {
                previousFound = markerPosition;
            }
        }

        console.log('go to', previousFound);

        if (!previousFound) {
            this.setTarget(0);
            return;
        }

        this.setTarget(previousFound);
    }

    setTarget(target) {
        this.targetX = target;
        this.scrollPercent = Math.floor((target * 100) / this.maxX);
    }
}

window.addEventListener('load', _ => { new Timeline() });
