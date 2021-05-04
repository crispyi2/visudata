// @ts-check

(function () {

	// Get a reference to the VS Code webview api.
	// We use this API to post messages back to our extension.

	// @ts-ignore
	const vscode = acquireVsCodeApi();


	const jsonRoot = /** @type {HTMLElement} */ (document.querySelector('.elements'));

	const addButtonContainer = document.querySelector('.add-button');
	addButtonContainer.querySelector('button').addEventListener('click', () => {
		vscode.postMessage({
			type: 'add'
		});
	})

	const errorContainer = document.createElement('div');
	document.body.appendChild(errorContainer);
	errorContainer.className = 'error'
	errorContainer.style.display = 'none'

	/**
	 * Render the document in the webview.
	 */
	function updateContent(/** @type {string} */ text) {
		let json;
		try {
			json = JSON.parse(text);
		} catch {
			jsonRoot.style.display = 'none';
			return;
		}
		jsonRoot.style.display = '';
		errorContainer.style.display = 'none';

		jsonRoot.innerHTML = '';
		for (const note of json.editors || []) {
			const rootElement = document.createElement('div');
			rootElement.className = 'root';
			jsonRoot.appendChild(rootElement);

			const created = document.createElement('div');
			created.className = 'created';
			created.innerText = new Date(note.created).toUTCString();
			rootElement.appendChild(created);

			const deleteButton = document.createElement('button');
			deleteButton.className = 'delete-button';
			deleteButton.addEventListener('click', () => {
				vscode.postMessage({ type: 'delete', id: note.id, });
			});
			rootElement.appendChild(deleteButton);
		}

		jsonRoot.appendChild(addButtonContainer);
	}

	// Handle messages sent from the extension to the webview
	window.addEventListener('message', event => {
		const message = event.data; // The json data that the extension sent
		switch (message.type) {
			case 'update':
				const text = message.text;

				// Update our webview's content
				updateContent(text);

				// Then persist state information.
				// This state is returned in the call to `vscode.getState` below when a webview is reloaded.
				vscode.setState({ text });

				return;
		}
	});

	// Webviews are normally torn down when not visible and re-created when they become visible again.
	// State lets us save information across these re-loads
	const state = vscode.getState();
	if (state) {
		updateContent(state.text);
	}
}());