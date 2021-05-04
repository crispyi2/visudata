// @ts-check

(function () {

	// Get a reference to the VS Code webview api.
	// We use this API to post messages back to our extension.

	// @ts-ignore
	const vscode = acquireVsCodeApi();


	const jsonDoccument = /** @type {HTMLElement} */ (document.querySelector('.editor'));

	const addObjectButtonContainer = document.querySelector('.add-object-button');
	addButtonContainer.querySelector('button').addEventListener('click', () => {
		vscode.postMessage({
			type: 'add'
		});
	})
    const addArrayButtonContainer = document.querySelector('.add-array-button');
	addArrayButtonContainer.querySelector('button').addEventListener('click', () => {
		vscode.postMessage({
			type: 'add'
		});
	})
    const addBooleanButtonContainer = document.querySelector('.add-boolean-button');
	addBooleanButtonContainer.querySelector('button').addEventListener('click', () => {
		vscode.postMessage({
			type: 'add'
		});
	})
    const addNumberButtonContainer = document.querySelector('.add-number-button');
	addNumberButtonContainer.querySelector('button').addEventListener('click', () => {
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
			jsonDoccument.style.display = 'none';
			return;
		}
		jsonDoccument.style.display = '';
		errorContainer.style.display = 'none';

		jsonDoccument.innerHTML = '';
		for (const note of json.editors || []) {
			const rootObject = document.createElement('div');
			rootObject.className = 'root';
			jsonDoccument.appendChild(rootObject);

			const deleteButton = document.createElement('button');
			deleteButton.className = 'delete-button';
			deleteButton.addEventListener('click', () => {
				vscode.postMessage({ type: 'delete', id: note.id, });
			});
			rootObject.appendChild(deleteButton);
		}

		jsonDoccument.appendChild(addObjectButtonContainer);
        jsonDoccument.appendChild(addArrayButtonContainer);
        jsonDoccument.appendChild(addBooleanButtonContainer);
        jsonDoccument.appendChild(addNumberButtonContainer);
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