export interface CastMember {
    name: string;
    role: string;
    imageUrl?: string;
}

export interface Movie {
    id: string;
    title: string;
    description: string;
    director: string;
    cast: CastMember[];
    rating: number;
    duration: string;
    year: string;
    color: string;
    tags: string[];
    trailerUrl: string; // YouTube ID or URL
    coverImage?: string;
}

export const MOVIES: Record<string, Movie> = {
    "dune-2": {
        id: "dune-2",
        title: "Dune: Part Two",
        description: "Paul Atreides, ailesini yok eden komploculara karşı intikam savaşında Chani ve Fremenlerle birleşiyor. Evrenin kaderi ile aşkı arasında bir seçim yapmak zorunda kalan Paul, sadece kendisinin öngörebileceği korkunç bir geleceği engellemeye çalışır.",
        director: "Denis Villeneuve",
        cast: [
            { name: "Timothée Chalamet", role: "Paul Atreides" },
            { name: "Zendaya", role: "Chani" },
            { name: "Rebecca Ferguson", role: "Lady Jessica" },
            { name: "Javier Bardem", role: "Stilgar" },
            { name: "Josh Brolin", role: "Gurney Halleck" },
            { name: "Austin Butler", role: "Feyd-Rautha" }
        ],
        rating: 8.9,
        duration: "2s 46dk",
        year: "2024",
        color: "from-orange-600 to-amber-900",
        tags: ["Bilim Kurgu", "Macera", "Epik"],
        trailerUrl: "Way9Dexny3w", // YouTube ID
        coverImage: "https://image.tmdb.org/t/p/original/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg" // High quality poster
    },
    "oppenheimer": {
        id: "oppenheimer",
        title: "Oppenheimer",
        description: "Amerikalı bilim adamı J. Robert Oppenheimer ve atom bombasının geliştirilmesindeki rolü üzerine destansı bir biyografi. Manhattan Projesi'nin liderliğinde dünyayı kurtarmak için onu yok etme riskini göze alan bir adamın hikayesi.",
        director: "Christopher Nolan",
        cast: [
            { name: "Cillian Murphy", role: "J. Robert Oppenheimer" },
            { name: "Emily Blunt", role: "Kitty Oppenheimer" },
            { name: "Robert Downey Jr.", role: "Lewis Strauss" },
            { name: "Matt Damon", role: "Leslie Groves" },
            { name: "Florence Pugh", role: "Jean Tatlock" }
        ],
        rating: 8.4,
        duration: "3s 00dk",
        year: "2023",
        color: "from-red-600 to-orange-900",
        tags: ["Biyografi", "Dram", "Tarih"],
        trailerUrl: "uYPbbksJxIg",
        coverImage: "https://image.tmdb.org/t/p/original/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg" // High quality poster
    },
    "godzilla": {
        id: "godzilla",
        title: "Godzilla x Kong",
        description: "İki kadim titan, Godzilla ve Kong, dünyayı tehdit eden devasa bir tehlikeye karşı güçlerini birleştiriyor. İnsanlık ise bu destansı savaşın ortasında hayatta kalmaya çalışıyor.",
        director: "Adam Wingard",
        cast: [
            { name: "Rebecca Hall", role: "Dr. Ilene Andrews" },
            { name: "Brian Tyree Henry", role: "Bernie Hayes" },
            { name: "Dan Stevens", role: "Trapper" }
        ],
        rating: 6.7,
        duration: "1s 55dk",
        year: "2024",
        color: "from-purple-600 to-blue-900",
        tags: ["Aksiyon", "Macera", "Canavar"],
        trailerUrl: "lV1OOlGwExM",
        coverImage: "https://image.tmdb.org/t/p/original/tMefBSflR6PGQLv7WvFPpKLZkyk.jpg" // High quality poster
    },
    "kungfu-4": {
        id: "kungfu-4",
        title: "Kung Fu Panda 4",
        description: "Po, Barış Vadisi'nin Ruhani Lideri olmaya hazırlanırken yeni bir kötüyle, Bukalemun'la yüzleşmek zorundadır. Bu sırada yeni bir Ejderha Savaşçısı bulup eğitmesi gerekir.",
        director: "Mike Mitchell",
        cast: [
            { name: "Jack Black", role: "Po (Voice)" },
            { name: "Awkwafina", role: "Zhen (Voice)" },
            { name: "Viola Davis", role: "The Chameleon (Voice)" }
        ],
        rating: 7.6,
        duration: "1s 34dk",
        year: "2024",
        color: "from-yellow-500 to-orange-700",
        tags: ["Animasyon", "Komedi", "Aile"],
        trailerUrl: "_inKs4eeHiI",
        coverImage: "https://image.tmdb.org/t/p/original/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg" // High quality poster
    },
    "civil-war": {
        id: "civil-war",
        title: "Civil War",
        description: "Distopik bir gelecekte ABD'de yaşanan iç savaşı konu alan aksiyon dolu bir gerilim. Bir grup gazeteci, isyancı gruplar Beyaz Saray'a ulaşmadan önce Washington D.C.'ye varmak için tehlikeli bir yolculuğa çıkar.",
        director: "Alex Garland",
        cast: [
            { name: "Kirsten Dunst", role: "Lee" },
            { name: "Wagner Moura", role: "Joel" },
            { name: "Cailee Spaeny", role: "Jessie" },
            { name: "Nick Offerman", role: "President" }
        ],
        rating: 7.8,
        duration: "1s 49dk",
        year: "2024",
        color: "from-gray-600 to-gray-900",
        tags: ["Aksiyon", "Gerilim", "Savaş"],
        trailerUrl: "aDyQxtg0V2w",
        coverImage: "https://image.tmdb.org/t/p/original/sh7Rg8Er3tFcN9AdeGSJDQVZS51.jpg" // High quality poster
    },
    // IMDb Top 250 Additions
    "shawshank": {
        id: "shawshank",
        title: "Esaretin Bedeli",
        description: "Andy Dufresne, masum olduğunu iddia etmesine rağmen karısını ve sevgilisini öldürmekten suçlu bulunur ve Shawshank Hapishanesi'ne gönderilir.",
        director: "Frank Darabont",
        cast: [
            { name: "Tim Robbins", role: "Andy Dufresne" },
            { name: "Morgan Freeman", role: "Ellis Boyd 'Red' Redding" }
        ],
        rating: 9.3,
        duration: "2s 22dk",
        year: "1994",
        color: "from-blue-800 to-gray-900",
        tags: ["Dram", "Suç", "Klasik"],
        trailerUrl: "PLl99DlL6b4",
        coverImage: "https://image.tmdb.org/t/p/original/q6y0Go1r1rFOPbjyvHEf0nivMk.jpg"
    },
    "godfather": {
        id: "godfather",
        title: "Baba",
        description: "Corleone suç ailesinin yaşlanan patriği, gizli imparatorluğunun kontrolünü isteksiz oğluna devreder.",
        director: "Francis Ford Coppola",
        cast: [
            { name: "Marlon Brando", role: "Don Vito Corleone" },
            { name: "Al Pacino", role: "Michael Corleone" }
        ],
        rating: 9.2,
        duration: "2s 55dk",
        year: "1972",
        color: "from-gray-900 to-black",
        tags: ["Suç", "Dram", "Klasik"],
        trailerUrl: "UaVTIH8mujA",
        coverImage: "https://image.tmdb.org/t/p/original/3bhkrj58Vtu7enYsRolD1fZdja1.jpg"
    },
    "dark-knight": {
        id: "dark-knight",
        title: "Kara Şövalye",
        description: "Joker olarak bilinen tehdit Gotham halkını kaosa sürüklediğinde, Batman adaletsizlikle savaşma yeteneğini test eden en büyük psikolojik ve fiziksel sınavıyla yüzleşmek zorundadır.",
        director: "Christopher Nolan",
        cast: [
            { name: "Christian Bale", role: "Bruce Wayne / Batman" },
            { name: "Heath Ledger", role: "Joker" }
        ],
        rating: 9.0,
        duration: "2s 32dk",
        year: "2008",
        color: "from-blue-900 to-black",
        tags: ["Aksiyon", "Suç", "Dram"],
        trailerUrl: "EXeTwQWrcwY",
        coverImage: "https://image.tmdb.org/t/p/original/qJ2tW6WMUDux911r6m7haRef0WH.jpg"
    },
    "pulp-fiction": {
        id: "pulp-fiction",
        title: "Ucuz Roman",
        description: "İki mafya tetikçisi, bir boksör, bir gangster ve karısı ile bir çift soyguncunun hayatları, şiddet ve kurtuluşun dört hikayesinde iç içe geçer.",
        director: "Quentin Tarantino",
        cast: [
            { name: "John Travolta", role: "Vincent Vega" },
            { name: "Samuel L. Jackson", role: "Jules Winnfield" }
        ],
        rating: 8.9,
        duration: "2s 34dk",
        year: "1994",
        color: "from-red-900 to-yellow-900",
        tags: ["Suç", "Dram", "Kült"],
        trailerUrl: "s7EdQ4FqbhY",
        coverImage: "https://image.tmdb.org/t/p/original/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg"
    },
    "lotr-return": {
        id: "lotr-return",
        title: "Yüzüklerin Efendisi: Kralın Dönüşü",
        description: "Gandalf ve Aragorn, Sauron'un ordusuna karşı Dünya'nın kaderini belirleyecek savaşta İnsanlar Dünyası'na liderlik ederken, Frodo ve Sam Yüzük Dağı'na yaklaşır.",
        director: "Peter Jackson",
        cast: [
            { name: "Elijah Wood", role: "Frodo Baggins" },
            { name: "Viggo Mortensen", role: "Aragorn" }
        ],
        rating: 9.0,
        duration: "3s 21dk",
        year: "2003",
        color: "from-green-900 to-black",
        tags: ["Macera", "Fantastik", "Epik"],
        trailerUrl: "r5X-hFf6Bwo",
        coverImage: "https://image.tmdb.org/t/p/original/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg"
    }
};

export const getMovie = (id: string): Movie | null => {
    return MOVIES[id] || null;
};
