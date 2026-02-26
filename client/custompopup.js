const CONSTANTS = require('../resources/constants.js');

class CustomPopup {
    constructor(socket) {
        this.socket      = socket;
        this.isShowing   = false;
        this.mode        = 'public'; // 'public' | 'private'
        this.code        = '';
        this.citysrc     = '';
        this.configured  = false;
        this.publicRooms = [];
        this.currentRoomName = ''; // popup mode context (private_/public_ = change-map only)
        this.activeRoomName  = ''; // always the player's actual current room
    }

    // Called by client.js whenever the server sends a fresh public-rooms list
    updatePublicRooms(rooms) {
        this.publicRooms = rooms;
        if (this.isShowing) this._renderPublicRoomsList();
    }

    // Pick a random map from the datalist when the user chose "Random"
    _resolveRandomCitysrc() {
        const input = document.getElementById('requestedCitysrc_choice');
        let citysrc = input ? input.value.trim() : '';
        if (citysrc === 'Random') {
            const opts = Array.from(
                document.getElementById('requestedCitysrc').children
            ).filter(o => o.value && o.value.trim() !== '' && o.value !== ' ' && o.value !== 'Random');
            if (opts.length > 0)
                citysrc = opts[Math.floor(Math.random() * opts.length)].value;
        }
        return citysrc;
    }

    _renderPublicRoomsList() {
        const container = document.getElementById('custompopup-rooms-entries');
        if (!container) return;
        container.innerHTML = '';
        if (!this.publicRooms || this.publicRooms.length === 0) {
            container.innerHTML = '<div class="custompopup-no-rooms">No active public rooms</div>';
            return;
        }
        const table = document.createElement('table');
        table.className = 'custompopup-rooms-table';
        const thead = table.createTHead();
        const hrow = thead.insertRow();
        ['Name', 'Map', 'Players', ''].forEach(h => {
            const th = document.createElement('th');
            th.textContent = h;
            hrow.appendChild(th);
        });
        const tbody = table.createTBody();
        this.publicRooms.forEach(room => {
            const tr = tbody.insertRow();
            const nameCell = tr.insertCell();
            nameCell.textContent = room.roomLabel || room.roomId;

            const mapCell = tr.insertCell();
            mapCell.innerHTML = (room.flair ? room.flair + ' ' : '') + room.citysrc;

            const playersCell = tr.insertCell();
            playersCell.textContent = room.playerCount;

            const btnCell = tr.insertCell();
            const joinBtn = document.createElement('button');
            joinBtn.type = 'button';
            joinBtn.className = 'custompopup-join-btn';
            const isCurrent = room.roomId === this.activeRoomName;
            if (isCurrent) {
                joinBtn.textContent = 'Here';
                joinBtn.disabled = true;
                joinBtn.style.opacity = '0.45';
                joinBtn.style.cursor = 'default';
            } else {
                joinBtn.textContent = 'Join';
                joinBtn.addEventListener('click', () => {
                    this.socket.emit('joinPublicRoom', room.roomId);
                    this.closePopup(true);
                });
            }
            btnCell.appendChild(joinBtn);
        });
        container.appendChild(table);
    }

    // Sets public/private toggle state and shows/hides form rows accordingly.
    // Only call this when the toggle is visible (not in change-map-only mode).
    _setMode(mode) {
        this.mode = mode;
        const codeRow      = document.getElementById('custompopup-code-row');
        const nameRow      = document.getElementById('custompopup-name-row');
        const codeInput    = document.getElementById('selected_code');
        const citysrcInput = document.getElementById('requestedCitysrc_choice');
        const publicBtn    = document.getElementById('custompopup-public-btn');
        const privateBtn   = document.getElementById('custompopup-private-btn');
        const submitBtn    = document.getElementById('custompopup-submit');
        const maptitle     = document.getElementById('maptitle');
        const roomsSection = document.getElementById('custompopup-rooms-section');

        if (mode === 'public') {
            if (codeRow)      codeRow.style.display = 'none';
            if (nameRow)      nameRow.style.display = '';
            if (codeInput)    codeInput.required = false;
            if (citysrcInput) citysrcInput.required = true;
            publicBtn.classList.add('custompopup-toggle-active');
            privateBtn.classList.remove('custompopup-toggle-active');
            if (submitBtn)    submitBtn.value = 'Create Public Room';
            if (maptitle)     maptitle.textContent = 'Choose map';
            const sepEl2 = document.getElementById('custompopup-sep');
            if (roomsSection) roomsSection.style.display = '';
            if (sepEl2)       sepEl2.style.display = '';
            if (citysrcInput) citysrcInput.focus();
        } else {
            if (codeRow)      codeRow.style.display = '';
            if (nameRow)      nameRow.style.display = 'none';
            if (codeInput)    codeInput.required = true;
            if (citysrcInput) citysrcInput.required = false;
            publicBtn.classList.remove('custompopup-toggle-active');
            privateBtn.classList.add('custompopup-toggle-active');
            if (submitBtn)    submitBtn.value = 'Create Private Room';
            if (maptitle)     maptitle.textContent = 'Choose / change map';
            const sepEl2 = document.getElementById('custompopup-sep');
            if (roomsSection) roomsSection.style.display = 'none';
            if (sepEl2)       sepEl2.style.display = 'none';
            if (codeInput)    codeInput.focus();
        }
    }

    showPopup(roomName, currentCitysrc) {
        this.currentRoomName = roomName || '';
        this.isShowing  = false; // prevent _renderPublicRoomsList flicker before show
        this.configured = false;
        $('.overlay-bg').show();
        $('.custompopup').show();
        this.isShowing = true;

        const citysrcInput = document.getElementById('requestedCitysrc_choice');
        const nameRow      = document.getElementById('custompopup-name-row');
        const submitBtn    = document.getElementById('custompopup-submit');
        const maptitle     = document.getElementById('maptitle');
        const titleEl      = document.getElementById('custompopup-title');
        const toggleDiv    = document.getElementById('custompopup-toggle');
        const newRoomLabel = document.getElementById('custompopup-new-room-label');
        const roomsSection = document.getElementById('custompopup-rooms-section');
        const sepEl        = document.getElementById('custompopup-sep');

        const inCustomRoom = this.currentRoomName.startsWith('private') ||
                             this.currentRoomName.startsWith('public');

        const showRooms = (show) => {
            if (roomsSection) roomsSection.style.display = show ? '' : 'none';
            if (sepEl)        sepEl.style.display        = show ? '' : 'none';
        };
        const showToggle = (show) => {
            if (toggleDiv)    toggleDiv.style.display    = show ? '' : 'none';
            if (newRoomLabel) newRoomLabel.style.display = show ? '' : 'none';
        };

        if (inCustomRoom) {
            // Blue button inside a custom room: change map only, no public/private toggle
            if (titleEl)      { titleEl.textContent = 'Change Map'; titleEl.style.display = ''; }
            showToggle(false);
            if (nameRow)      nameRow.style.display = 'none';
            if (maptitle)     maptitle.style.display = 'none';
            if (citysrcInput && currentCitysrc) citysrcInput.value = currentCitysrc;
            if (submitBtn)    submitBtn.value = 'Change Map';
            showRooms(false);
            if (citysrcInput) citysrcInput.focus();
        } else {
            // Outside a custom room (or grey button browse): rooms on top, create form below
            if (titleEl)      titleEl.style.display = 'none';
            if (maptitle)     maptitle.style.display = '';
            showToggle(true);
            showRooms(true);
            if (citysrcInput) citysrcInput.value = '';
            this._setMode('public');

            document.getElementById('custompopup-public-btn').onclick  = () => this._setMode('public');
            document.getElementById('custompopup-private-btn').onclick = () => this._setMode('private');
        }

        this._renderPublicRoomsList();

        const closePopup    = () => this.closePopup(false);
        const configuredClose = () => this.closePopup(true);

        $('.close-btn, .overlay-bg').unbind().click(function() { closePopup(); });
        $(document).keyup(function(e) { if (e.keyCode === 27) closePopup(); });

        $("form#custompopup-form").off().submit((e) => {
            e.preventDefault();
            const citysrc = this._resolveRandomCitysrc();
            if (this.currentRoomName.startsWith('private')) {
                // Change map in private room: re-enter same room with new citysrc
                const code = this.currentRoomName.replace('private_', '');
                this.socket.emit('moveToPrivate', citysrc, code);
            } else if (this.currentRoomName.startsWith('public')) {
                this.socket.emit('changePublicRoomMap', citysrc);
            } else if (this.mode === 'public') {
                const labelInput = document.getElementById('custompopup-room-label');
                const roomLabel  = labelInput ? labelInput.value.trim() : '';
                this.socket.emit('createPublicRoom', citysrc, roomLabel);
            } else {
                const code = document.getElementById('selected_code').value;
                this.code    = code;
                this.citysrc = citysrc;
                this.socket.emit('moveToPrivate', citysrc, code);
            }
            configuredClose();
        });
    }

    closePopup(configured) {
        this.configured = !!configured;
        $('.overlay-bg, .overlay-content-code').hide();
        this.isShowing = false;
        var x = window.scrollX, y = window.scrollY;
        $('#msg_text').focus();
        window.scrollTo(x, y);
    }

    hide() {
        $('.overlay-content-code').hide();
    }
}

module.exports = CustomPopup;
