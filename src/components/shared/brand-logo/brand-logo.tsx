export function BrandLogo() {
    return (
        <span
            className="brand-logo"
            role="img"
            aria-label="Legacy Wealth Cooperatives">
            <span className="brand-tree" aria-hidden="true">
                <img
                    className="brand-tree-source"
                    src="/brand/legacy-tree.png"
                    width={48}
                    height={56}
                    alt=""
                />
                <span className="brand-tree-inverse" />
            </span>
            <span className="brand-wordmark" aria-hidden="true">
                <span>LEGACY</span>
                <span>WEALTH</span>
                <span>COOPERATIVES</span>
            </span>
        </span>
    );
}
