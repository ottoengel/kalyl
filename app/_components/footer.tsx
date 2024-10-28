import { Card, CardContent } from "./ui/card"

const Footer = () => {
  return (
    <footer className="fixed bottom-0 w-full">
      <Card>
        <CardContent className="px-5 py-6">
          <p className="text-sm text-gray-400">
            © 2024 Copyright <span className="font-bold">Barbearia Kalyl</span>
          </p>
        </CardContent>
      </Card>
    </footer>
  )
}

export default Footer
