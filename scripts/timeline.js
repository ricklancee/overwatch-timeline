class Timeline {

    constructor() {
        this.container = document.querySelector('.timeline__container');
        this.markers = document.querySelectorAll('.timeline__marker');
        this.minimap = document.querySelector('.timeline__minimap');
        this.minimapIndicator = document.querySelector('.timeline__minimap__indicator');
        this.minimapMakerContainer = document.querySelector('.timeline__minimap__markers');

        this.onScroll = this.onScroll.bind(this);
        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);
        this.update = this.update.bind(this);

        this.targetX = 0;
        this.currentX = 0;
        this.scrollPercent = 0;
        this.maxX = this.container.offsetWidth;
        this.minX = 0;

        this.minimapWidth = this.minimap.offsetWidth;
        this.minimapCurrentX = 0;

        this.startTouchX = 0;
        this.currentTouchX = 0;
        this.touchXMoved = 0;

        // Todo: refacor
        this.markerPositions = [];
        [].forEach.call(this.markers, (marker) => {
            const width = marker.offsetWidth / 2;
            const left = marker.offsetLeft;
            const position = left + width;
            this.markerPositions.push(position);
        });
        this.markersLength = this.markerPositions.length;

        console.log('Marker positions', this.markerPositions);

        this.createMinimapMarkers();

        this.addEventListeners();
        requestAnimationFrame(this.update);
    }

    addEventListeners() {
        document.addEventListener('mousewheel', this.onScroll);

        document.addEventListener('touchmove', this.onTouchMove);
        document.addEventListener('touchstart', this.onTouchStart);
        document.addEventListener('touchend', this.onTouchEnd);

        // Tmp click check.
        this.container.addEventListener('click', (evt) => {
            if (!evt.target.classList.contains('timeline__marker')) {
                return;
            }

            this.targetX = evt.target.offsetLeft + 7;
            console.log('go to', this.targetX);
            this.scrollPercent = (this.targetX * 100) / this.maxX;;
        });

        document.addEventListener('keyup', (evt) => {
            if (evt.keyCode == 39) { // right
                evt.preventDefault();
                this.goToNextMaker();
            } else if (evt.keyCode == 37) { // left
                evt.preventDefault();
                this.goToPreviousMaker();
            }
        });
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

    onTouchStart(evt) {
        this.startTouchX = evt.touches[0].pageX;
        this.currentTouchX = this.startTouchX;

        console.log('touch start', this.startTouchX);
        console.log('touch start', this.currentTouchX);

        evt.preventDefault();
    }

    onTouchMove(evt) {
        this.currentTouchX = evt.touches[0].pageX;
        this.touchXMoved = this.currentTouchX - this.startTouchX;

        if (this.targetX < this.minX) {
            this.targetX = this.minX;
            return;
        }

        if (this.targetX > this.maxX) {
            this.targetX = this.maxX;
            return;
        }


        this.targetX += this.touchXMoved * 0.1;
        this.scrollPercent = Math.floor((this.targetX * 100) / this.maxX);

        console.log('touch moving', this.touchXMoved);
    }

    onTouchEnd(evt) {
        this.touchXMoved = 0;
        console.log('touch ended');
    }

    update() {
        requestAnimationFrame(this.update);

        // Todo: refactor
        for (var i = 0; i < this.markersLength; i++) {
            if (this.targetX >= this.markerPositions[i]) {
                this.markers[i].classList.add('timeline__marker--hit');
            } else if (this.targetX <= this.markerPositions[i]) {
                this.markers[i].classList.remove('timeline__marker--hit');
            }
        }

        this.updateTimeline();
        this.updateMinimap();
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
            this.targetX = this.maxX;
            return;
        }

        // Set the target position
        this.targetX = nextFound;
        this.scrollPercent = Math.floor((this.targetX * 100) / this.maxX);
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
            this.targetX = 0;
            return;
        }

        // Set the target position
        this.targetX = previousFound;
        this.scrollPercent = Math.floor((this.targetX * 100) / this.maxX);

    }
}

window.addEventListener('load', _ => { new Timeline() });
