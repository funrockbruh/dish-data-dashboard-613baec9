import { Button } from "./ui/button";
export const Footer = () => {
  return <footer className="bg-secondary py-12 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Product</h4>
            <ul className="space-y-2">
              <li>
                <Button variant="link" className="p-0 h-auto">Features</Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto">Pricing</Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto">Demo</Button>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Company</h4>
            <ul className="space-y-2">
              <li>
                <Button variant="link" className="p-0 h-auto">About</Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto">Blog</Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto">Careers</Button>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Support</h4>
            <ul className="space-y-2">
              <li>
                <Button variant="link" className="p-0 h-auto">Help Center</Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto">Contact</Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto">Privacy</Button>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Get Started</h4>
            <p className="text-muted-foreground">
              Ready to transform your menu management?
            </p>
            <Button className="hover-lift">Start Free Trial</Button>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t text-center text-muted-foreground">
          <p>© 2025 Websitely. All rights reserved.</p>
        </div>
      </div>
    </footer>;
};