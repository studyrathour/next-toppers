document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  let batchData = null;
  let navigationStack = [];

  const fetchAndRender = async () => {
    try {
      const response = await fetch('data.json');
      if (!response.ok) throw new Error('Network response was not ok');
      batchData = await response.json();
      navigateTo('root');
    } catch (error) {
      app.innerHTML = '<p style="color: red;">Failed to load course data.</p>';
      console.error('Error fetching data:', error);
    }
  };

  const navigateTo = (type, data) => {
    navigationStack.push({ type, data });
    render();
  };

  const goBack = () => {
    if (navigationStack.length > 1) {
      navigationStack.pop();
      render();
    }
  };

  const render = () => {
    app.innerHTML = '';
    const currentView = navigationStack[navigationStack.length - 1];

    if (navigationStack.length > 1) {
      const backButton = document.createElement('button');
      backButton.className = 'back-button';
      backButton.textContent = '← Back';
      backButton.onclick = goBack;
      app.appendChild(backButton);
    }

    switch (currentView.type) {
      case 'root':
        renderRoot();
        break;
      case 'subject':
        renderSubject(currentView.data);
        break;
    }
  };

  const createTile = (title, imageUrl, onClick) => {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.onclick = onClick;
    tile.innerHTML = `
      <img src="${imageUrl}" alt="${title}" onerror="this.style.display='none'">
      <h3>${title}</h3>
    `;
    return tile;
  };

  const renderRoot = () => {
    const header = document.createElement('div');
    header.className = 'header';
    header.innerHTML = `
      <img src="${batchData.thumbnail}" alt="${batchData.name}">
      <h1>${batchData.name}</h1>
      <p>${batchData.description}</p>
    `;
    app.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'grid';
    batchData.subjects.forEach(subject => {
      const tile = createTile(subject.name, subject.thumbnail, () => navigateTo('subject', subject));
      grid.appendChild(tile);
    });
    app.appendChild(grid);
  };

  const renderSubject = (subject) => {
    const header = document.createElement('h2');
    header.className = 'subject-header';
    header.textContent = subject.name;
    app.appendChild(header);

    const contentContainer = document.createElement('div');
    let activeTab = subject.sections.length > 0 ? subject.sections[0].type : null;

    const renderContent = () => {
        contentContainer.innerHTML = '';
        const grid = document.createElement('div');
        grid.className = 'grid';

        const sectionsOfType = subject.sections.filter(s => s.type === activeTab);
        if (sectionsOfType.length === 0) {
            grid.innerHTML = '<p>No content available for this section.</p>';
        } else {
            sectionsOfType.forEach(section => {
                section.contents.forEach(content => {
                    const card = document.createElement('div');
                    card.className = 'tile content-card';
                    card.innerHTML = `
                        <img src="${content.thumbnail}" alt="${content.title}" onerror="this.style.display='none'">
                        <h3>${content.title}</h3>
                        <a href="${content.url}" target="_blank" rel="noopener noreferrer">View Content</a>
                    `;
                    grid.appendChild(card);
                });
            });
        }
        contentContainer.appendChild(grid);
    };

    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'tabs';
    const availableTypes = [...new Set(subject.sections.map(s => s.type))];
    
    if (availableTypes.length > 0 && !availableTypes.includes(activeTab)) {
        activeTab = availableTypes[0];
    }
    
    availableTypes.forEach(type => {
        const tab = document.createElement('div');
        tab.className = 'tab';
        tab.textContent = type.charAt(0).toUpperCase() + type.slice(1) + 's';
        if (type === activeTab) tab.classList.add('active');
        tab.onclick = () => {
            activeTab = type;
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderContent();
        };
        tabsContainer.appendChild(tab);
    });
    
    app.appendChild(tabsContainer);
    app.appendChild(contentContainer);
    if(activeTab) {
      renderContent();
    }
  };

  fetchAndRender();
});
